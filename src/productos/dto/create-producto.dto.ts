import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateProductoDto {
    @ApiProperty({ description: 'Nombre del producto', example: 'Pizza' })
    @IsString()
    nombre_producto: string;
    
    @ApiProperty({ description: 'Precio del producto $', example: 2.5 })
    @IsNumber()
    precio_producto: number;

}
