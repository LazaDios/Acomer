import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, MoreThanOrEqual } from 'typeorm';
import { DetalleComanda } from './entities/detalle-comanda.entity';
import { CreateMultipleDetallesDto } from './dto/create-detalle-comanda.dto';
import { Comanda } from '../comandas/entities/comanda.entity';
import { Producto } from '../productos/entities/producto.entity';
import { UpdateDetalleComandaDto } from './dto/update-detalle-comanda.dto';
import { EstadoComanda } from '../common/enums/comanda-estado.enum';
import { ComandaGateway } from '../events/comanda.gateway';

@Injectable()
export class DetalleComandasService {

  constructor(
    @InjectRepository(DetalleComanda)
    private readonly detalleComandaRepository: Repository<DetalleComanda>,
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly comandaGateway: ComandaGateway
  ) { }

  async create(CreateMultipleDetallesDto: CreateMultipleDetallesDto): Promise<DetalleComanda[]> {
    const { comandaId, detalles } = CreateMultipleDetallesDto;

    const comanda = await this.comandaRepository.findOne({ where: { comanda_id: comandaId } });
    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${comandaId} no encontrada.`);
    }

    const productosIds = detalles.map(d => d.producto_id);
    const productos = await this.productoRepository.findBy({ id_producto: In(productosIds) });

    if (productos.length !== productosIds.length) {
      const foundIds = new Set(productos.map(p => p.id_producto));
      const missingIds = productosIds.filter(id => !foundIds.has(id));
      throw new NotFoundException(`Algunos productos no fueron encontrados: IDs ${missingIds.join(', ')}.`);
    }

    const productosMap = new Map(productos.map(p => [p.id_producto, p]));
    const detallesParaGuardar: DetalleComanda[] = [];

    for (const item of detalles) {
      const producto = productosMap.get(item.producto_id);
      if (item.cantidad <= 0) {
        throw new BadRequestException(`La cantidad para el producto ID ${item.producto_id} debe ser un número positivo.`);
      }

      const precioUnitario = producto?.precio_producto!;
      const subtotal = item.cantidad * precioUnitario;

      const nuevoDetalle = this.detalleComandaRepository.create({
        comanda,
        producto,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal,
        descripcion: item.descripcion,
        id_restaurante: comanda.id_restaurante
      });
      detallesParaGuardar.push(nuevoDetalle);
    }

    const detallesGuardados = await this.detalleComandaRepository.save(detallesParaGuardar);
    await this.recalculateComandaTotalMUCHAS(comanda.comanda_id);

    this.comandaGateway.notifyComandaUpdate(comanda.comanda_id, comanda.estado_comanda, 'Nuevos productos agregados');
    this.comandaGateway.notifyComandaToKitchen(comanda.comanda_id, comanda.estado_comanda, 'Nuevos productos agregados');

    return detallesGuardados;
  }

  private async recalculateComandaTotalMUCHAS(comanda_id: number): Promise<void> {
    const comanda = await this.comandaRepository
      .createQueryBuilder('comanda')
      .leftJoinAndSelect('comanda.detallesComanda', 'detallesComanda')
      .where('comanda.comanda_id = :comanda_id', { comanda_id })
      .getOne();

    if (comanda) {
      const totalCalculado = comanda.detallesComanda.reduce((sum, detalle) => {
        return sum + parseFloat(detalle.subtotal.toString());
      }, 0);

      comanda.total_comanda = totalCalculado;
      await this.comandaRepository.save(comanda);
    }
  }

  async findAll(restauranteId: number): Promise<DetalleComanda[]> {
    return this.detalleComandaRepository.find({
      where: { id_restaurante: restauranteId },
      relations: ['comanda', 'producto']
    });
  }

  async remove(id: number): Promise<void> {
    const detalle = await this.detalleComandaRepository.findOne({
      where: { id_detalle_comanda: id },
      relations: ['comanda']
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle de comanda con ID ${id} no encontrado.`);
    }

    const comandaId = detalle.comanda.comanda_id;
    await this.detalleComandaRepository.remove(detalle);
    await this.recalculateComandaTotalMUCHAS(comandaId);

    const comandaBase = await this.comandaRepository.findOne({ where: { comanda_id: comandaId } });
    if (comandaBase) {
      this.comandaGateway.notifyComandaUpdate(comandaId, comandaBase.estado_comanda, 'Producto eliminado');
      this.comandaGateway.notifyComandaToKitchen(comandaId, comandaBase.estado_comanda, 'Producto eliminado');
    }
  }

  async updateSingleDetalleComanda(
    comandaId: number,
    detalleId: number,
    updateDto: UpdateDetalleComandaDto,
  ): Promise<DetalleComanda> {
    const comanda = await this.comandaRepository.findOne({ where: { comanda_id: comandaId } });
    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${comandaId} no encontrada.`);
    }

    const detalle = await this.detalleComandaRepository.findOne({
      where: { id_detalle_comanda: detalleId, comanda: { comanda_id: comandaId } },
      relations: ['producto'],
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle de comanda con ID ${detalleId} no encontrado.`);
    }

    let productoActualizado = detalle.producto;
    let precioUnitarioActualizado = detalle.precioUnitario;

    if (updateDto.nuevoProductoId && updateDto.nuevoProductoId !== detalle.producto.id_producto) {
      const nuevoProducto = await this.productoRepository.findOne({ where: { id_producto: updateDto.nuevoProductoId } });
      if (!nuevoProducto) throw new NotFoundException('Nuevo producto no encontrado.');
      productoActualizado = nuevoProducto;
      precioUnitarioActualizado = nuevoProducto.precio_producto!;
    }

    if (updateDto.cantidad !== undefined) detalle.cantidad = updateDto.cantidad;
    if (updateDto.descripcion !== undefined) detalle.descripcion = updateDto.descripcion;

    detalle.producto = productoActualizado;
    detalle.precioUnitario = precioUnitarioActualizado;
    detalle.subtotal = detalle.cantidad * detalle.precioUnitario;

    const detalleActualizado = await this.detalleComandaRepository.save(detalle);
    await this.recalculateComandaTotalMUCHAS(comandaId);

    this.comandaGateway.notifyComandaUpdate(comandaId, comanda.estado_comanda, 'Producto actualizado');
    this.comandaGateway.notifyComandaToKitchen(comandaId, comanda.estado_comanda, 'Producto actualizado');

    return detalleActualizado;
  }

  async findComandasByRestaurant(restauranteId: number, days: number = 60) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    return await this.comandaRepository.find({
      where: {
        id_restaurante: restauranteId,
        fecha_hora_comanda: MoreThanOrEqual(dateLimit)
      },
      relations: ['detallesComanda', 'detallesComanda.producto'],
      order: { fecha_hora_comanda: 'DESC' }
    });
  }

  async findOneWithDetails(id: number): Promise<Comanda> {
    const comanda = await this.comandaRepository.findOne({
      where: { comanda_id: id },
      relations: ['detallesComanda', 'detallesComanda.producto'],
      order: { detallesComanda: { id_detalle_comanda: 'ASC' } },
    });
    if (!comanda) throw new NotFoundException(`Comanda con ID ${id} no encontrada.`);
    return comanda;
  }

  async findComandasForCocineroDashboard(restauranteId: number): Promise<Comanda[]> {
    const estadosCocinero: EstadoComanda[] = [EstadoComanda.ABIERTA, EstadoComanda.PREPARANDO];
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 60);

    return this.comandaRepository.find({
      where: {
        id_restaurante: restauranteId,
        estado_comanda: In(estadosCocinero),
        fecha_hora_comanda: MoreThanOrEqual(dateLimit)
      },
      relations: ['detallesComanda', 'detallesComanda.producto'],
      order: { comanda_id: 'ASC' }
    });
  }

  async findComandasForMesoneroDashboard(restauranteId: number): Promise<Comanda[]> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 60);

    return this.comandaRepository.find({
      where: {
        id_restaurante: restauranteId,
        estado_comanda: In([EstadoComanda.ABIERTA, EstadoComanda.PREPARANDO, EstadoComanda.FINALIZADA]),
        fecha_hora_comanda: MoreThanOrEqual(dateLimit)
      },
      relations: ['detallesComanda', 'detallesComanda.producto'],
      order: { fecha_hora_comanda: 'DESC' }
    });
  }
}