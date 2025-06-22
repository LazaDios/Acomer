import { DetalleComanda } from "src/detalle_comandas/entities/detalle_comanda.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// Si tienes Mesa y Mesonero como entidades separadas y las quieres como FK, impórtalas:
// import { Mesa } from '../../mesa/entities/mesa.entity';
// import { Mesonero } from '../../mesonero/entities/mesonero.entity';

@Entity()
export class Comanda {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    mesa: string;

    @CreateDateColumn()
    fecha: Date;

    @Column()
    estado: string = 'abierta';

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number = 0;

    @Column()
    nombre_camarero: string;

    @DeleteDateColumn()
    deletedAt: Date;

    // Relación One-to-Many: Una Comanda puede tener muchos DetalleComanda
    // 'cascade: ["insert", "update"]' es importante para que al guardar la Comanda,
    // también se guarden o actualicen sus DetalleComanda asociados.
    @OneToMany(() => DetalleComanda, (detalle) => detalle.comanda, { cascade: ["insert", "update"] })
    detalles: DetalleComanda[];

}   
