import {IsNotEmpty, IsString } from "class-validator";

export class CreateComandaDto {

    @IsString()
    @IsNotEmpty()
    mesa : String;

    @IsString()
    nombre_mesonero = " ";

}
