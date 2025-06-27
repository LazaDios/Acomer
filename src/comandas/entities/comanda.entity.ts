import { EstadoComanda } from "src/common/enums/comanda-estado.enum";
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

  // --- ¡Nueva columna para el estado! ---
  @Column({
    type: 'enum', // Le dice a TypeORM que use un tipo ENUM en la DB
    enum: EstadoComanda, // Referencia a tu enum de TypeScript
    default: EstadoComanda.ABIERTA, // Estado predeterminado al crear una comanda
  })
  estado_comanda: EstadoComanda;

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
