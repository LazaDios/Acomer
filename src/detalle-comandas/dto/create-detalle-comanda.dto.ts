import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsNotEmpty, ValidateNested, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDetalleComandaDto {
 
  @IsInt({ message: 'comandaId debe ser un número entero.' })
  @IsPositive({ message: 'comandaId debe ser un número positivo.' })
  @IsNotEmpty({ message: 'comandaId no puede estar vacío.' })
  comanda_id: number;

 
  @IsInt({ message: 'productoId debe ser un número entero.' })
  @IsPositive({ message: 'productoId debe ser un número positivo.' })
  @IsNotEmpty({ message: 'productoId no puede estar vacío.' })
  producto_id: number;

  
  @IsInt({ message: 'cantidad debe ser un número entero.' })
  @IsPositive({ message: 'cantidad debe ser un número positivo.' })
  @IsNotEmpty({ message: 'cantidad no puede estar vacío.' })
  cantidad: number;

  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto.' })
  @MaxLength(255, { message: 'descripcion no puede exceder los 255 caracteres.' })
  descripcion?: "S/N"; // Hazla opcional si no siempre se requiere

}
// DTO para un solo item dentro del array 'detalles'
// NOTA: Este DTO NO debe tener comandaId.
export class DetalleItemDto {
 
  @IsInt({ message: 'productoId debe ser un número entero.' })
  @IsPositive({ message: 'productoId debe ser un número positivo.' })
  @IsNotEmpty({ message: 'productoId no puede estar vacío.' })
  producto_id: number;

  @IsInt({ message: 'cantidad debe ser un número entero.' })
  @IsPositive({ message: 'cantidad debe ser un número positivo.' })
  @IsNotEmpty({ message: 'cantidad no puede estar vacío.' })
  cantidad: number;

  @IsOptional()
  @IsString({ message: 'descripcion debe ser una cadena de texto.' })
  @MaxLength(255, { message: 'descripcion no puede exceder los 255 caracteres.' })
  descripcion?: "S/N"; // Hazla opcional si no siempre se requiere
}

// DTO principal para añadir múltiples detalles
export class CreateMultipleDetallesDto {

  @IsInt({ message: 'comandaId debe ser un número entero.' })
  @IsPositive({ message: 'comandaId debe ser un número positivo.' })
  @IsNotEmpty({ message: 'comandaId no puede estar vacío.' })
  comandaId: number;

  @IsArray({ message: 'detalles debe ser un array.' })
  @ValidateNested({ each: true })
  @Type(() => DetalleItemDto)
  detalles: DetalleItemDto[];
}