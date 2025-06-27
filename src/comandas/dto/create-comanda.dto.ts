import { IsNotEmpty, IsString } from "class-validator";

export class CreateComandaDto {

    @IsString()
    @IsNotEmpty()
    mesa : String;

    @IsString()
    @IsNotEmpty()
    nombre_mesonero: String;

}
