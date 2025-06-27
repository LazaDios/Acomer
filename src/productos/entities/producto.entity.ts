import { DetalleComanda } from "src/detalle-comandas/entities/detalle-comanda.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    id_producto: number;

    @Column()
    nombre_producto: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    precio_producto: number;

    //Relación inversa: Un Producto puede aparecer en muchos DetalleComanda
    @OneToMany(() => DetalleComanda, (detalle) => detalle.producto)
    detallesComanda: DetalleComanda[];
    
}
