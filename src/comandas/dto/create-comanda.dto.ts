import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty, IsString } from "class-validator";

export class CreateComandaDto {

    @ApiProperty({ description: 'El numero de mesa', example: '01' })
    @IsString()
    @IsNotEmpty()
    mesa : String;

    @IsString()
    nombre_mesonero = " ";

}
