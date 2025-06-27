import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comanda } from './entities/comanda.entity';
import { Repository } from 'typeorm';
import { EstadoComanda } from 'src/common/enums/comanda-estado.enum';


@Injectable()
export class ComandasService {

  constructor(
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>
  ){}

  async create(createComandaDto: CreateComandaDto): Promise<Comanda> {

    const comanda = this.comandaRepository.create({
      mesa: createComandaDto.mesa,
      nombre_mesonero: createComandaDto.nombre_mesonero,
      total_comanda: 0,
    });

    return await this.comandaRepository.save(comanda);
  }

  async findAll() {
    return await this.comandaRepository.find();
  }

 async findOne(comanda_id: number) {
    return await this.comandaRepository.findOneBy({comanda_id});
  }

  async update(comanda_id: number, UpdateComandaDto: UpdateComandaDto) {
    return await this.comandaRepository.update(comanda_id, UpdateComandaDto);
  }

 async remove(comanda_id: number): Promise<void> {
    const comanda = await this.comandaRepository.findOne({
      where: { comanda_id: comanda_id },
  });
   if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${comanda_id} no encontrada.`);
    }
    // Al eliminar la comanda, la base de datos se encargará de eliminar los detalles asociados
    await this.comandaRepository.remove(comanda);
}



  async updateComandaStatus(comanda_id: number, newStatus: EstadoComanda): Promise<Comanda> {
    const comanda = await this.comandaRepository.findOne({ where: { comanda_id } });

    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${comanda_id} no encontrada.`);
    }

    // --- Lógica de validación de transición de estado (¡MUY IMPORTANTE!) ---
    // Esto evita que un cocinero cierre una comanda, o que se ponga a preparar una ya cerrada.
    if (newStatus === EstadoComanda.PREPARANDO && comanda.estado_comanda !== EstadoComanda.ABIERTA) {
      throw new BadRequestException(`No se puede poner la comanda en "${EstadoComanda.PREPARANDO}" si no está en "${EstadoComanda.ABIERTA}".`);
    }
    if (newStatus === EstadoComanda.FINALIZADA && comanda.estado_comanda !== EstadoComanda.PREPARANDO) {
      throw new BadRequestException(`No se puede finalizar la comanda si no está en "${EstadoComanda.PREPARANDO}".`);
    }
    if (newStatus === EstadoComanda.CERRADA && comanda.estado_comanda !== EstadoComanda.FINALIZADA) {
      throw new BadRequestException(`No se puede cerrar la comanda si no está en "${EstadoComanda.FINALIZADA}".`);
    }
    if (newStatus === EstadoComanda.CANCELADA && (comanda.estado_comanda === EstadoComanda.CERRADA || comanda.estado_comanda === EstadoComanda.FINALIZADA)) {
      throw new BadRequestException(`No se puede cancelar una comanda que ya está "${EstadoComanda.CERRADA}" o "${EstadoComanda.FINALIZADA}".`);
    }
    // Puedes añadir más reglas según tus necesidades.
    // --- Fin de la lógica de validación ---


    comanda.estado_comanda = newStatus; // Asigna el nuevo estado
    const updatedComanda = await this.comandaRepository.save(comanda);

    // Si estás implementando notificaciones en tiempo real (WebSockets):
    // Aquí es donde emitirías un evento para el camarero si el estado es FINALIZADA
    // o para cocina si es CANCELADA.
    // Ejemplo:
    // if (newStatus === EstadoComanda.FINALIZADA) {
    //   this.eventGateway.server.emit('comandaLista', { comandaId: updatedComanda.id_comanda });
    // }
    // if (newStatus === EstadoComanda.CANCELADA) {
    //   this.eventGateway.server.emit('comandaCancelada', { comandaId: updatedComanda.id_comanda });
    // }

    return updatedComanda;
  }



















}
