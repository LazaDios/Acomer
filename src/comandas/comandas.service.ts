import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comanda } from './entities/comanda.entity';
import { DetalleComanda } from 'src/detalle_comandas/entities/detalle_comanda.entity';
import { Producto } from 'src/productos/entities/producto.entity';


@Injectable()
export class ComandasService {
  constructor(
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>,
    @InjectRepository(DetalleComanda)
    private readonly detalleComandaRepository: Repository<DetalleComanda>,
    @InjectRepository(Producto) // Inyecta el repositorio de Producto para buscar precios
    private readonly productoRepository: Repository<Producto>,
  ) {}
 



  async crearComandaConProductos(comandaDto: CreateComandaDto): Promise<Comanda> {
    // 1. Crear la instancia de Comanda
    const nuevaComanda = this.comandaRepository.create({
      mesa: comandaDto.mesa,
      nombre_camarero: comandaDto.nombre_camarero,
      estado: 'abierta', // Estado inicial de la comanda
      total: 0, // Inicialmente el total es 0
      detalles: [], // Inicialmente vacío, se llenará después

    });

    let totalComandaCalculado = 0;
    const detallesComanda: DetalleComanda[] = [];

    // 2. Iterar sobre los ítems de productos recibidos en el DTO
    for (const itemDto of comandaDto.items) {
      // Buscar el producto en la base de datos para obtener su precio unitario
      const producto = await this.productoRepository.findOne({
        where: { id: itemDto.idProducto },
      });

      if (!producto) {
        throw new NotFoundException(`Producto con ID ${itemDto.idProducto} no encontrado en el menú.`);
      }

      // Calcular el subtotal para este ítem
      const subtotalItem = itemDto.cantidad * producto.precio_unitario;
      totalComandaCalculado += subtotalItem;

      // Crear una instancia de DetalleComanda para este ítem
      const detalle = this.detalleComandaRepository.create({
        producto: producto, // Enlaza el detalle con la entidad Producto
        cantidad: itemDto.cantidad,
        subtotal_item: subtotalItem,
        // La relación 'comanda' en DetalleComanda se establecerá automáticamente
        // cuando guardemos la 'nuevaComanda' debido a la opción 'cascade'
      });
      detallesComanda.push(detalle);
    }

    // 3. Asignar los detalles y el total calculado a la comanda
    nuevaComanda.detalles = detallesComanda;
    nuevaComanda.total = totalComandaCalculado;

    // 4. Guardar la comanda (y sus detalles gracias al cascade)
    // Esto guardará la Comanda y automáticamente insertará los DetalleComanda relacionados.
    const comandaGuardada = await this.comandaRepository.save(nuevaComanda);

    // Opcional: Aquí podrías añadir la lógica para crear el registro inicial en la tabla EstadoCocina
    // si tienes un servicio para EstadoCocina.
    // Ej: await this.estadoCocinaService.crearEstadoInicial(comandaGuardada.id_comanda, 'En preparación');

    return comandaGuardada[0]; // Retorna la comanda guardada, asumiendo que el método devuelve un array
  }




  async findAll() {
    const comandas = await this.comandaRepository.find({
      relations: ['detalles', 'detalles.producto'], // Carga los detalles y los productos asociados
    });
    return comandas;
  }




  async obtenerComandaConDetalles(id: number): Promise<Comanda> {
    const comanda = await this.comandaRepository.findOne({
      where: { id: id },
      relations: ['detalles', 'detalles.producto'], // Carga los detalles y los productos asociados
    });

    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${id} no encontrada.`);
    }
    return comanda;
  }

  // Otros métodos como obtener pedidos para la cocina, marcar como listo, etc.,
  /* se construirían de forma similar, usando los repositorios y relaciones.
  async findOne(id: number) {
    return await this.comandaRepository.findOneBy({id});
  }*/

  // Actualizar el detalle de comanda y recalcular el total de la comanda
  async actualizarDetalleComanda(idDetalle: number, updateDetalleDto: UpdateComandaDto): Promise<Comanda> {
    const detalle = await this.detalleComandaRepository.findOne({
      where: { id_detalle_comanda: idDetalle },
      relations: ['comanda'], // Carga la comanda asociada al detalle
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle de comanda con ID ${idDetalle} no encontrado.`);
    }

    // Actualizar el detalle de comanda
    const updatedDetalle = this.detalleComandaRepository.merge(detalle);
    await this.detalleComandaRepository.save(updatedDetalle);

    // Actualizar el total de la comanda
    const comanda = detalle.comanda;
    comanda.total = comanda.detalles.reduce((total, det) => total + det.subtotal_item, 0); // Recalcula el total

    // Guardar la comanda actualizada
    return await this.comandaRepository.save(comanda);
  }

  async update(id: number, updateComandaDto: UpdateComandaDto) {
    return await this.comandaRepository.update(id, updateComandaDto);
  }

  //debo eliminar la comanda con sus detalles comandas
  async eliminarComanda(id: number): Promise<void> {
    const comanda = await this.comandaRepository.findOne({
      where: { id: id },
      relations: ['detalles'], // Carga los detalles asociados a la comanda
    });
    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${id} no encontrada.`);
    }
  }

  //cuando elimine un detalle de comanda, se debe actualizar el total de la comanda
  async eliminarDetalleComanda(idDetalle: number): Promise<Comanda> {
    const detalle = await this.detalleComandaRepository.findOne({
      where: { id_detalle_comanda: idDetalle },
      relations: ['comanda'], // Carga la comanda asociada al detalle
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle de comanda con ID ${idDetalle} no encontrado.`);
    }

    // Eliminar el detalle de comanda
    await this.detalleComandaRepository.softDelete(idDetalle);

    // Actualizar el total de la comanda
    const comanda = detalle.comanda;
    comanda.total -= detalle.subtotal_item; // Resta el subtotal del detalle eliminado

    // Guardar la comanda actualizada
    return await this.comandaRepository.save(comanda);
  }

}
