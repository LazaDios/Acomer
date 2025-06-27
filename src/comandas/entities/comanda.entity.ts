import { DetalleComanda } from "src/detalle-comandas/entities/detalle-comanda.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comanda {

    @PrimaryGeneratedColumn()
    comanda_id: number;

    @Column()
    mesa : String;

    @Column()
    nombre_mesonero: String;

    @Column()
    estado_comanda: String;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    total_comanda = 0;

    @CreateDateColumn()
    fecha_hora_comanda: Date;


    @OneToMany(() => DetalleComanda, detalle => detalle.comanda, {
    cascade: true,
    onDelete: 'CASCADE', // ¡Esto es indispensable!
  }) 
  detallesComanda: DetalleComanda[];

}
