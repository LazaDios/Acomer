import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Comanda } from '../../comandas/entities/comanda.entity'; // Asegúrate de que la ruta sea correcta
import { Producto } from '../../productos/entities/producto.entity';



@Entity('detalle_comandas') // Nombre de la tabla en la DB
export class DetalleComanda {
  @PrimaryGeneratedColumn()
  id_detalle_comanda: number;

  @ManyToOne(() => Comanda, (comanda) => comanda.comanda_id) // Relación N:1 con Comanda
  @JoinColumn({ name: 'comanda_id', referencedColumnName: 'comanda_id' }) // Especifica la columna de la clave foránea
  comanda: Comanda; // Propiedad para acceder al objeto Comanda relacionado

  @ManyToOne(() => Producto, (producto) => producto.id_producto) // Relación N:1 con Producto/Plato
  @JoinColumn({ name: 'producto_id' }) // Especifica la columna de la clave foránea
  producto: Producto; // Propiedad para acceder al objeto Producto/Plato relacionado

  @Column({ type: 'int' })  
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // Ajusta precision y scale según tus necesidades
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) // 'nullable: true' si el subtotal es opcional
  subtotal: number;

  // --- ¡Nueva propiedad aquí! ---
  @Column({ type: 'varchar', length: 255, nullable: true }) // Permite que sea opcional
  descripcion: string;


}