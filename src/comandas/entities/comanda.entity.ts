import { ApiProperty } from "@nestjs/swagger";
import { EstadoComanda } from "src/common/enums/comanda-estado.enum";
import { DetalleComanda } from "src/detalle-comandas/entities/detalle-comanda.entity";
import { Restaurante } from "../../restaurantes/entities/restaurante.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity()
export class Comanda {

  @ApiProperty({
    description: 'Identificador único de la comanda',
    example: 1,
    readOnly: true, // Este campo es generado automáticamente
  })
  @PrimaryGeneratedColumn()
  comanda_id: number;

  @ApiProperty({
    description: 'Número o nombre de la mesa asociada a la comanda',
    example: 'Mesa 5',
    maxLength: 50, // Ejemplo de restricción de longitud
  })
  @Column()
  mesa: String;

  @ApiProperty({
    description: 'Nombre del mesonero que creó o gestiona la comanda',
    example: 'Maria Gonzalez',
    maxLength: 100, // Ejemplo de restricción de longitud
  })
  @Column()
  nombre_mesonero: string;


  @ApiProperty({
    description: 'Estado actual de la comanda',
    enum: EstadoComanda, // Esto indica que el valor debe ser uno de los del enum
    example: EstadoComanda.ABIERTA, // Un valor de ejemplo del enum
    default: EstadoComanda.ABIERTA, // Indica el valor por defecto
  })
  @Column({
    type: 'enum', // Le dice a TypeORM que use un tipo ENUM en la DB
    enum: EstadoComanda, // Referencia a tu enum de TypeScript
    default: EstadoComanda.ABIERTA, // Estado predeterminado al crear una comanda
  })
  estado_comanda: EstadoComanda;

  @ApiProperty({
    description: 'Costo total de la comanda',
    example: 75.50,
    type: Number, // Asegura que se interprete como número
    format: 'float', // Formato de número flotante
    default: 0, // Indica el valor por defecto
    readOnly: true, // Generalmente, el total es calculado y no se envía en la creación/actualización directa
  })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  total_comanda = 0;

  @ApiProperty({
    description: 'Fecha y hora de creación de la comanda',
    example: '2025-07-15T10:30:00Z',
    type: String, // Se representa como string en OpenAPI para fechas
    format: 'date-time', // Formato estándar de fecha y hora
    readOnly: true, // Este campo es generado automáticamente por la DB
  })
  @CreateDateColumn()
  fecha_hora_comanda: Date;

  @ManyToOne(() => Restaurante, (restaurante) => restaurante.comandas, { nullable: true })
  @JoinColumn({ name: 'id_restaurante' })
  restaurante: Restaurante;

  @Column({ nullable: true })
  id_restaurante: number;




  @OneToMany(() => DetalleComanda, detalle => detalle.comanda, {
    cascade: true,
    onDelete: 'CASCADE', // ¡Esto es indispensable!
  })
  detallesComanda: DetalleComanda[];

}
