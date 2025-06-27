import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleComandaDto } from './create-detalle-comanda.dto';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class UpdateDetalleComandaDto extends PartialType(CreateDetalleComandaDto) {

  @IsOptional() // Hacemos opcional para la creación, pero no para la actualización de uno existente
  @IsInt()
  @IsPositive()
  id_detalle_comanda?: number; // Para identificar el detalle específico a actualizar

  @IsOptional()
  @IsInt()
  @IsPositive()
  nuevoProductoId?: number; // Si quieres cambiar el producto (ej. de perro a hamburguesa)

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'La cantidad no puede ser negativa.' }) // Permite 0 para "eliminar"
  cantidad?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion: "S/N";
}
