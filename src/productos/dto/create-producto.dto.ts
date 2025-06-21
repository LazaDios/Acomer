import { IsNumber, IsString } from "class-validator";

export class CreateProductoDto {
    @IsString()
    nombre: string;

    @IsString()
    descripcion: string;

    @IsNumber()
    precio_unitario: number;

    @IsString()
    tipo_producto: string;

}
