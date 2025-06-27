import { IsNumber, IsString } from "class-validator";

export class CreateProductoDto {
    @IsString()
    nombre_producto: string;

    @IsNumber()
    precio_producto: number;

}
