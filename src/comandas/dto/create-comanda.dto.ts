import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

// DTO para cada ítem de producto dentro de la comanda
export class ItemComandaDto {
  @IsNotEmpty()
  @IsNumber()
  idProducto: number;

  @IsNotEmpty()
  @IsNumber()
  cantidad: number;
}

export class CreateComandaDto {
    
    @IsNotEmpty()
    @IsString()
    mesa: string;

    @IsNotEmpty()
    @IsString()
    nombre_camarero: string;

    @IsArray()
    @ValidateNested({ each: true }) // Valida cada objeto dentro del array
    @Type(() => ItemComandaDto) // Asegura la transformación a la clase ItemComandaDto
    items: ItemComandaDto[]; // La lista de productos y cantidades

}
