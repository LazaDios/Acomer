// src/detalle-comandas/dto/create-detalle-comanda.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsNotEmpty, ValidateNested, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // <-- ¡Importa ApiProperty!

/*export class CreateDetalleComandaDto { // Este DTO parece ser para un solo detalle de comanda

  @ApiProperty({
    description: 'ID de la comanda a la que pertenece este detalle',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'comandaId debe ser un número entero.' })
  @IsPositive({ message: 'comandaId debe ser un número positivo.' })
  @IsNotEmpty({ message: 'comandaId no puede estar vacío.' })
  comanda_id: number;

  @ApiProperty({
    description: 'ID del producto asociado a este detalle de comanda',
    example: 101,
    type: Number,
  })
  @IsInt({ message: 'productoId debe ser un número entero.' })
  @IsPositive({ message: 'productoId debe ser un número positivo.' })
  @IsNotEmpty({ message: 'productoId no puede estar vacío.' })
  producto_id: number;

  @ApiProperty({
    description: 'Cantidad del producto en este detalle de comanda',
    example: 2,
    minimum: 1, // Añade una validación visual para el mínimo
    type: Number,
  })
  @IsInt({ message: 'cantidad debe ser un número entero.' })
  @IsPositive({ message: 'cantidad debe ser un número positivo.' })
  @IsNotEmpty({ message: 'cantidad no puede estar vacío.' })
  cantidad: number;

  @ApiProperty({
    description: 'Notas o descripción adicional para el producto en este detalle (ej. "sin cebolla", "bien cocido")',
    example: 'Sin pepinillos',
    maxLength: 255,
    required: false, // Indica que este campo es opcional
  })
  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto.' })
  @MaxLength(255, { message: 'descripcion no puede exceder los 255 caracteres.' })
  // Si "S/N" es solo un valor por defecto o un placeholder, asegúrate de que el tipo sea 'string' o 'string | undefined'
  descripcion?: string; // Cambiado de "S/N" a 'string' para que sea un tipo válido
}

ACTUALMENTE NO LO ESTOY USANDO*/

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