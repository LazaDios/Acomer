import {Column, 
        DeleteDateColumn, 
        Entity, 
        JoinColumn, 
        ManyToOne, 
        PrimaryGeneratedColumn 
    } from "typeorm";
import { Comanda } from "src/comandas/entities/comanda.entity";
import { Producto } from "src/productos/entities/producto.entity";

@Entity()
export class DetalleComanda {
    @PrimaryGeneratedColumn()
    id_detalle_comanda: number;

    @Column()
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal_item: number; // Subtotal de este ítem (cantidad * precio_unitario del producto)

    // Propiedad para el soft delete en detalle_comanda
    @DeleteDateColumn()
    deletedAt?: Date;

    // Relación Many-to-One: Muchos DetalleComanda pertenecen a una Comanda
    @ManyToOne(() => Comanda, (comanda) => comanda.detalles)
    @JoinColumn({ name: 'id_comanda' }) // Define la columna de la clave foránea en DetalleComanda
    comanda: Comanda; // Propiedad para acceder a la Comanda relacionada

    // Relación Many-to-One: Muchos DetalleComanda se refieren a un Producto
    @ManyToOne(() => Producto, (producto) => producto.detallesComanda)
    @JoinColumn({ name: 'id_producto' }) // Define la columna de la clave foránea en DetalleComanda
    producto: Producto; // Propiedad para acceder al Producto relacionado

}
