import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DetalleComanda } from './entities/detalle-comanda.entity';
import { /*CreateDetalleComandaDto,*/ CreateMultipleDetallesDto } from './dto/create-detalle-comanda.dto'; // Necesitaremos este DTO
import { Comanda } from '../comandas/entities/comanda.entity'; // Importa la entidad Comanda
import { Producto } from '../productos/entities/producto.entity';
import { UpdateDetalleComandaDto } from './dto/update-detalle-comanda.dto';
import { EstadoComanda } from '../common/enums/comanda-estado.enum';

@Injectable()
export class DetalleComandasService {

  constructor(
    @InjectRepository(DetalleComanda)
    private readonly detalleComandaRepository: Repository<DetalleComanda>,
    @InjectRepository(Comanda) // Inyecta el repositorio de Comanda
    private readonly comandaRepository: Repository<Comanda>,
    @InjectRepository(Producto) // Inyecta el repositorio de Producto
    private readonly productoRepository: Repository<Producto>,
  ) { }


  async create(CreateMultipleDetallesDto: CreateMultipleDetallesDto): Promise<DetalleComanda[]> {

    const { comandaId, detalles } = CreateMultipleDetallesDto;

    //1. verificar si la comanda existe
    const comanda = await this.comandaRepository.findOne({ where: { comanda_id: comandaId } });
    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${comandaId} no encontrada.`);
    }

    const productosIds = detalles.map(d => d.producto_id);
    // 2. Obtener todos los productos necesarios de una sola vez para optimizar
    const productos = await this.productoRepository.findBy({ id_producto: In(productosIds) }); // Usar `In` de TypeORM

    if (productos.length !== productosIds.length) {
      // Identificar qué productos no se encontraron
      const foundIds = new Set(productos.map(p => p.id_producto));
      const missingIds = productosIds.filter(id => !foundIds.has(id));
      throw new NotFoundException(`Algunos productos no fueron encontrados: IDs ${missingIds.join(', ')}.`);
    }

    const productosMap = new Map(productos.map(p => [p.id_producto, p]));
    const detallesParaGuardar: DetalleComanda[] = [];

    // 3. Procesar cada detalle de la lista
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
        id_restaurante: comanda.id_restaurante // Heredamos el restaurante de la comanda
      });
      detallesParaGuardar.push(nuevoDetalle);
    }

    // 4. Guardar todos los nuevos detalles en una sola transacción (mejor rendimiento)
    const detallesGuardados = await this.detalleComandaRepository.save(detallesParaGuardar);

    // 5. Recalcular el total de la comanda después de guardar todos los detalles
    await this.recalculateComandaTotalMUCHAS(comanda.comanda_id);

    return detallesGuardados;
  }

  // src/detalle-comandas/detalle-comanda.service.ts
  // ...
  private async recalculateComandaTotalMUCHAS(comanda_id: number): Promise<void> {
    const comanda = await this.comandaRepository
      .createQueryBuilder('comanda')
      .leftJoinAndSelect('comanda.detallesComanda', 'detallesComanda')
      .where('comanda.comanda_id = :comanda_id', { comanda_id })
      .getOne();

    if (comanda) {
      // Asegúrate de que detalle.subtotal sea un número
      const totalCalculado = comanda.detallesComanda.reduce((sum, detalle) => {
        // Usa parseFloat para garantizar que se trate como número decimal
        return sum + parseFloat(detalle.subtotal.toString());
      }, 0); // Asegúrate de que el valor inicial sea 0 (un número)

      comanda.total_comanda = totalCalculado; // Asigna el número directamente
      await this.comandaRepository.save(comanda);
    }
  }



















  // --- Otros métodos comunes (ej. encontrar todos, encontrar por ID, actualizar, eliminar) ---

  async findAll(restauranteId: number): Promise<DetalleComanda[]> {
    return this.detalleComandaRepository.find({
      where: { id_restaurante: restauranteId },
      relations: ['comanda', 'producto']
    });
  }

  /*async findOne(id: number): Promise<DetalleComanda> {
    const detalle = await this.detalleComandaRepository.findOne({
      where: { comanda },
      relations: ['comanda', 'producto'],
    });
    if (!detalle) {
      throw new NotFoundException(`Detalle de Comanda con ID ${id} no encontrado.`);
    }
    return detalle;
  }*/

  /*update(id: number, UpdateDetalleComandaDto: UpdateDetalleComandaDto) {
    return `This action updates a #${id} detalleComanda`;
  }*/

  remove(id: number) {
    return `This action removes a #${id} detalleComanda`;
  }

  async updateSingleDetalleComanda(
    comandaId: number,
    detalleId: number,
    updateDto: UpdateDetalleComandaDto,
  ): Promise<DetalleComanda> {
    // 1. Verificar si la comanda existe y si su estado permite modificaciones
    const comanda = await this.comandaRepository.findOne({
      where: { comanda_id: comandaId },
    });

    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${comandaId} no encontrada.`);
    }


    // 2. Encontrar el detalle de comanda específico a modificar
    const detalle = await this.detalleComandaRepository.findOne({
      where: { id_detalle_comanda: detalleId, comanda: { comanda_id: comandaId } },
      relations: ['producto'], // Necesitamos el producto actual
    });

    if (!detalle) {
      throw new NotFoundException(
        `Detalle de comanda con ID ${detalleId} no encontrado para la comanda ID ${comandaId}.`,
      );
    }

    // 3. Aplicar las actualizaciones
    let productoActualizado = detalle.producto;
    let precioUnitarioActualizado = detalle.precioUnitario;

    // Si se está cambiando el producto asociado al detalle
    if (updateDto.nuevoProductoId && updateDto.nuevoProductoId !== detalle.producto.id_producto) {
      const nuevoProducto = await this.productoRepository.findOne({
        where: { id_producto: updateDto.nuevoProductoId },
      });

      if (!nuevoProducto) {
        throw new NotFoundException(`Nuevo producto con ID ${updateDto.nuevoProductoId} no encontrado.`);
      }
      productoActualizado = nuevoProducto;
      precioUnitarioActualizado = nuevoProducto.precio_producto!; // Asumimos precio_producto existe
    } else {
      // Si no se cambia el producto, el precio unitario podría haber cambiado en el maestro de productos
      const productoMaestro = await this.productoRepository.findOne({
        where: { id_producto: detalle.producto.id_producto },
      });
      if (productoMaestro && productoMaestro.precio_producto !== detalle.precioUnitario) {
        precioUnitarioActualizado = productoMaestro.precio_producto!;
      }
    }


    // Actualizar cantidad (si se proporciona)
    if (updateDto.cantidad !== undefined) {
      detalle.cantidad = updateDto.cantidad;
    }

    // Actualizar descripción (si se proporciona)
    if (updateDto.descripcion !== undefined) {
      detalle.descripcion = updateDto.descripcion;
    }

    // Recalcular subtotal con los nuevos valores
    detalle.producto = productoActualizado;
    detalle.precioUnitario = precioUnitarioActualizado;
    detalle.subtotal = detalle.cantidad * detalle.precioUnitario;

    // Si la cantidad se establece en 0, puedes añadir lógica adicional si lo necesitas.
    // Por ejemplo, un campo `activo: boolean` en DetalleComanda para marcarlo como inactivo
    // en lugar de confiar solo en la cantidad 0.
    // if (detalle.cantidad === 0) {
    //    detalle.activo = false; // Requiere añadir 'activo: boolean' a DetalleComanda
    // } else {
    //    detalle.activo = true;
    // }

    // 4. Guardar los cambios en el detalle
    const detalleActualizado = await this.detalleComandaRepository.save(detalle);

    // 5. Recalcular el total de la comanda padre
    // Importante: Si usas un campo `activo`, tu `recalculateComandaTotal` debe solo sumar los detalles activos.
    await this.recalculateComandaTotalMUCHAS(comandaId);

    return detalleActualizado;
  }

  // --- MÉTODO PARA EL DASHBOARD DEL COCINERO ---
  async findComandasForCocineroDashboard(restauranteId: number): Promise<Comanda[]> {
    // Definir los estados que le interesan al cocinero
    const estadosCocinero: EstadoComanda[] = [
      EstadoComanda.ABIERTA,
      EstadoComanda.PREPARANDO,
      EstadoComanda.CANCELADA, // Si el cocinero necesita ver las canceladas
    ];

    return this.comandaRepository.find({
      where: {
        id_restaurante: restauranteId, // <--- FILTRO AGREGADO
        estado_comanda: In(estadosCocinero),// Filtra las comandas por estos estados
      },
      relations: ['detallesComanda', 'detallesComanda.producto'], // <-- ¡Asegúrate de que el nombre de la relación sea 'detalles' si así la tienes en Comanda.entity.ts!
      order: {
        comanda_id: 'ASC', // O 'fecha_creacion: 'ASC'' para ordenarlas por la más antigua primero
      }
    });

  }


  async findOneWithDetails(id: number): Promise<Comanda> {
    const comanda = await this.comandaRepository.findOne({
      where: { comanda_id: id },
      relations: [
        // Carga los detalles de la comanda
        'detallesComanda',
        // Carga la información del producto dentro de cada detalle
        'detallesComanda.producto'
      ],
      // Opcional: ordenar los detalles por fecha de creación para consistencia
      order: {
        detallesComanda: {
          id_detalle_comanda: 'ASC',
        },
      },
    });

    if (!comanda) {
      throw new NotFoundException(`Comanda con ID ${id} no encontrada.`);
    }

    // Aquí puedes añadir lógica para calcular el total antes de devolverla
    // ...

    return comanda;
  }










  async findComandasForMesoneroDashboard(restauranteId: number): Promise<Comanda[]> {
    // Asumiendo que inyectaste el repositorio de Comanda como 'comandaRepository'
    // Si este servicio solo tiene 'detalleComandaRepository', necesitarás inyectar 'ComandaRepository' también.

    return this.comandaRepository.find({
      where: {
        id_restaurante: restauranteId, // <--- FILTRO AGREGADO
        estado_comanda: In([
          EstadoComanda.ABIERTA,
          EstadoComanda.PREPARANDO,
          EstadoComanda.FINALIZADA
        ]),
        // O simplemente: Not(EstadoComanda.CERRADA) si quieres ver todo menos lo cerrado
      },
      relations: ['detallesComanda', 'detallesComanda.producto'], // ¡Importante cargar las relaciones!
      order: {
        fecha_hora_comanda: 'DESC', // Las más recientes primero
      },
    });
  }














}





/*async create(createDetalleComandaDto: CreateDetalleComandaDto): Promise<DetalleComanda> {
   const { comanda_id, producto_id, cantidad } = createDetalleComandaDto;

   // 1. Verificar si la Comanda existe
   const comanda = await this.comandaRepository.findOne({ where: { comanda_id: comanda_id } });
   if (!comanda) {
     throw new NotFoundException(`Comanda con ID ${comanda_id} no encontrada.`);
   }

   // 2. Verificar si el Producto existe
   const producto = await this.productoRepository.findOne({ where: {id_producto: producto_id } });
   if (!producto) {
     throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
   }

   // 3. Validar la cantidad
   if (cantidad <= 0) {
     throw new BadRequestException('La cantidad debe ser un número positivo.');
   }

   // 4. Calcular el precio unitario (del producto al momento de añadirlo)
   // Es crucial tomar el precio del producto *actual* en este momento.
   // Asegúrate de que tu entidad Producto tenga una propiedad 'precio' o similar.
   const precioUnitario = producto.precio_producto; // Asumiendo que tu entidad Producto tiene una propiedad 'precio'

   // 5. Calcular el subtotal para esta línea de detalle
   const subtotal = cantidad * precioUnitario;

   // 6. Crear una nueva instancia de DetalleComanda
   const nuevoDetalle = this.detalleComandaRepository.create({
     comanda, // Asignamos el objeto Comanda
     producto, // Asignamos el objeto Producto
     cantidad,
     precioUnitario,
     subtotal,
     // No necesitamos asignar comandaId y productoId directamente si asignamos los objetos
     // TypeORM los manejará automáticamente gracias a las relaciones ManyToOne.
   });

   const detalleGuardado = await this.detalleComandaRepository.save(nuevoDetalle);

   await this.recalculateComantaTotal(comanda_id);

   return detalleGuardado;


   // . Guardar el nuevo detalle en la base de datos
   return this.detalleComandaRepository.save(nuevoDetalle);
 }

 private async recalculateComantaTotal(comanda_id:number): Promise<void>{
   const comanda = await this.comandaRepository
     .createQueryBuilder('comanda')
     .leftJoinAndSelect('comanda.detallesComanda' , 'detallesComanda') // ¡IMPORTANTE: Carga los detalles!
     .where('comanda.comanda_id = :comanda_id', {comanda_id})
     .getOne();

     if (comanda){
       const totalCalculado = comanda.detallesComanda.reduce((sum, detallesComanda) => sum + detallesComanda.subtotal, 0);
       comanda.total_comanda = totalCalculado;
       await this.comandaRepository.save(comanda);
     }
 }

*/