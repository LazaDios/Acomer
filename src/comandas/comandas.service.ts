import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comanda } from './entities/comanda.entity';
import { Repository } from 'typeorm';
import { EstadoComanda } from 'src/common/enums/comanda-estado.enum';
import { ComandaGateway } from 'src/events/comanda.gateway';



@Injectable()
export class ComandasService {
  private readonly logger = new Logger(ComandasService.name); //colocado nuevo para gateway

  constructor(
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>,
    private readonly ComandaGateway: ComandaGateway, //inyectar el Gateway
  ){}

  // 1. Método para crear una comanda (cuando el camarero la manda a cocina)
  async create(createComandaDto: CreateComandaDto): Promise<Comanda> {
    const comanda = this.comandaRepository.create(createComandaDto);
    comanda.estado_comanda = EstadoComanda.ABIERTA; // Asegurar estado inicial
    const savedComanda = await this.comandaRepository.save(comanda);

    console.log('DEBUG: About to call notifyComandaToKitchen'); // Add this line
    this.ComandaGateway.notifyComandaToKitchen(
      savedComanda.comanda_id,
      EstadoComanda.ABIERTA,
      `Nueva Comanda #${savedComanda.comanda_id}: Esperando preparación.`,
    );
    console.log('DEBUG: notifyComandaToKitchen called.'); // Add this line

    this.logger.log(`Comanda ${savedComanda.comanda_id} creada y notificada a cocina.`);
    return savedComanda;
  }

  // 2. Método para actualizar el estado de una comanda
  // Este método será llamado por los controladores de Cocina y Camarero
  async updateComandaStatus(comanda_id: number, newStatus: EstadoComanda): Promise<Comanda> {
    const comanda = await this.comandaRepository.findOne({ where: { comanda_id } });

    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${comanda_id} no encontrada.`);
    }

    const oldStatus = comanda.estado_comanda; // Para validar transiciones y emitir mensajes correctos

    // --- Lógica de validación de transición de estado (¡Esencial!) ---
    // Ejemplos:
    if (newStatus === EstadoComanda.PREPARANDO && oldStatus !== EstadoComanda.ABIERTA) {
      throw new BadRequestException(`Solo se puede pasar de Abierta a Preparando.`);
    }
    if (newStatus === EstadoComanda.FINALIZADA && oldStatus !== EstadoComanda.PREPARANDO) {
      throw new BadRequestException(`Solo se puede pasar de Preparando a Finalizada.`);
    }
    if (newStatus === EstadoComanda.CERRADA && oldStatus !== EstadoComanda.FINALIZADA) {
      throw new BadRequestException(`Solo se puede pasar de Finalizada a Cerrada.`);
    }
    if (newStatus === EstadoComanda.CANCELADA && (oldStatus === EstadoComanda.CERRADA)) {
      throw new BadRequestException(`No se puede cancelar una comanda ya Cerrada.`);
    }
    // ... (otras reglas de negocio para transiciones)

    comanda.estado_comanda = newStatus;
    const updatedComanda = await this.comandaRepository.save(comanda);

    // --- Lógica de Notificaciones basada en el NUEVO estado ---
    switch (newStatus) {
      case EstadoComanda.PREPARANDO:
        // Opcional: Podrías notificar a la cocina que alguien "tomó" la comanda
        // this.comandaGateway.notifyComandaToKitchen(updatedComanda.id_comanda, newStatus, `Comanda #${updatedComanda.id_comanda} en preparación.`);
        break;

      case EstadoComanda.FINALIZADA:
        // --- NOTIFICACIÓN A CAMARERO: Pedido listo ---
        this.ComandaGateway.notifyComandaToWaiter(
          updatedComanda.comanda_id,
          newStatus,
          `Comanda #${updatedComanda.comanda_id} está lista para entregar.`,
        );
        this.logger.log(`Comanda ${updatedComanda.comanda_id} finalizada y notificada a camarero.`);
        break;

      case EstadoComanda.CANCELADA:
        // --- NOTIFICACIÓN A COCINA: Pedido cancelado ---
        this.ComandaGateway.notifyComandaToKitchen(
          updatedComanda.comanda_id,
          newStatus,
          `¡ALERTA! Comanda #${updatedComanda.comanda_id} ha sido CANCELADA.`,
        );
        this.logger.log(`Comanda ${updatedComanda.comanda_id} cancelada y notificada a cocina.`);
        break;

      case EstadoComanda.CERRADA:
        // No se notifica a nadie específico para este caso, solo se guarda en DB.
        this.logger.log(`Comanda ${updatedComanda.comanda_id} ha sido cerrada.`);
        break;

      // Estado ABIERTA no necesita notificación aquí, ya se hizo en 'createComanda'
    }

    // Opcional: Notificación general para administradores o monitores
    this.ComandaGateway.notifyComandaUpdate(updatedComanda.comanda_id, newStatus);

    return updatedComanda;
  }


//##################################################################################################################

  async findAll() {
    return await this.comandaRepository.find();
  }

 async findOne(comanda_id: number) {
    return await this.comandaRepository.findOneBy({comanda_id});
  }

  async update(comanda_id: number, UpdateComandaDto: UpdateComandaDto) {
    return await this.comandaRepository.update(comanda_id, UpdateComandaDto);
  }

async softDelete(comanda_id: number): Promise<Comanda> {
    const comanda = await this.comandaRepository.findOne({
      where: { comanda_id: comanda_id },
    });

    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${comanda_id} no encontrada.`);
    }

    // Verifica que la comanda no esté ya cancelada o en un estado final
    if (comanda.estado_comanda === EstadoComanda.CANCELADA || comanda.estado_comanda === EstadoComanda.CERRADA) {
      // ¡¡¡CAMBIA ESTO!!!
      throw new BadRequestException(`La Comanda ${comanda_id} ya se encuentra en estado '${comanda.estado_comanda}'. No se puede cancelar.`);
    }

    comanda.estado_comanda = EstadoComanda.CANCELADA;
    await this.comandaRepository.save(comanda);

    // *** Aquí es donde notificas a Cocina y Mesonero ***
    const notificationPayload = {
      comanda_id: comanda.comanda_id,
      estado: comanda.estado_comanda, // "Cancelado"
      mensaje: `La Comanda #${comanda.comanda_id} ha sido CANCELADA.`,
      // Puedes añadir más detalles si la cocina o el mesonero los necesitan
      // Por ejemplo, quién la canceló, la razón, etc.
      // detalles: comanda.detalles // Si cargaste los detalles y quieres enviarlos
    };

    // Notificar a cocina
    this.ComandaGateway.emitToAll('comandaCanceladaToKitchen', notificationPayload); // O usa notifyKitchen con el payload específico
    // Notificar a mesonero
    this.ComandaGateway.emitToAll('comandaCanceladaToWaiter', notificationPayload); // O usa notifyWaiter con el payload específico

    return comanda;
  }

}
