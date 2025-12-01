// src/detalle-comandas/dto/create-detalle-comanda.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsNotEmpty, ValidateNested, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // <-- ¡Importa ApiProperty!


// DTO para un solo item dentro del array 'detalles' en CreateMultipleDetallesDto
export class DetalleItemDto {
  @ApiProperty({
    description: 'ID del producto a añadir',
    example: 101,
    type: Number,
  })
  @IsInt({ message: 'productoId debe ser un número entero.' })
  @IsPositive({ message: 'productoId debe ser un número positivo.' })
  @IsNotEmpty({ message: 'productoId no puede estar vacío.' })
  producto_id: number;

  @ApiProperty({
    description: 'Cantidad del producto a añadir',
    example: 2,
    minimum: 1,
    type: Number,
  })
  @IsInt({ message: 'cantidad debe ser un número entero.' })
  @IsPositive({ message: 'cantidad debe ser un número positivo.' })
  @IsNotEmpty({ message: 'cantidad no puede estar vacío.' })
  cantidad: number;

  @ApiProperty({
    description: 'Notas adicionales para este producto en la comanda',
    example: 'Extra queso',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto.' })
  @MaxLength(255, { message: 'descripcion no puede exceder los 255 caracteres.' })
  descripcion?: string; // Cambiado a 'string'
}

// DTO principal para añadir múltiples detalles a una comanda existente
export class CreateMultipleDetallesDto {

  @ApiProperty({
    description: 'ID de la comanda existente a la que se añadirán los detalles',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'comandaId debe ser un número entero.' })
  @IsPositive({ message: 'comandaId debe ser un número positivo.' })
  @IsNotEmpty({ message: 'comandaId no puede estar vacío.' })
  comandaId: number;

  @ApiProperty({
    description: 'Array de objetos de detalle que se añadirán a la comanda',
    type: () => [DetalleItemDto], // Referencia al DTO del ítem de detalle
    isArray: true, // Indica que es un array
    example: [ // Un ejemplo completo del array
      { producto_id: 101, cantidad: 1, descripcion: "Sin cebolla" },
      { producto_id: 102, cantidad: 2 }
    ],
  })
  @IsArray({ message: 'detalles debe ser un array.' })
  @ValidateNested({ each: true })
  @Type(() => DetalleItemDto)
  detalles: DetalleItemDto[];
}