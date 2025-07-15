import { ApiProperty } from "@nestjs/swagger";
import { DetalleComanda } from "src/detalle-comandas/entities/detalle-comanda.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Producto {

    @ApiProperty({
        description: 'Identificador único del producto',
        example: 1
    })
    @PrimaryGeneratedColumn()
    id_producto: number;

    @ApiProperty({
        description: 'Nombre del producto',
        example: 'Hamburguesa Clásica'
    })
    @Column()
    nombre_producto: string;

    @ApiProperty({
        description: 'Precio del producto',
        example: 12.50,
        type: Number, // Aunque es 'number' en TS, se mapea a 'number' o 'string' en OpenAPI para decimales
        format: 'float' // Opcional: para indicar que es un número flotante
    })
    @Column({ type: 'decimal', precision: 5, scale: 2 })
    precio_producto: number;


    // Relación inversa: Un Producto puede aparecer en muchos DetalleComanda
    @OneToMany(() => DetalleComanda, (detalle) => detalle.producto)
    detallesComanda: DetalleComanda[];
    
}
