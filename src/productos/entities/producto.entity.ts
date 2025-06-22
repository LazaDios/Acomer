import { DetalleComanda } from "src/detalle_comandas/entities/detalle_comanda.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    precio_unitario: number;

    @Column()
    tipo_producto: string;

    // Relación inversa: Un Producto puede aparecer en muchos DetalleComanda
    @OneToMany(() => DetalleComanda, (detalle) => detalle.producto)
    detallesComanda: DetalleComanda[];
    
}
