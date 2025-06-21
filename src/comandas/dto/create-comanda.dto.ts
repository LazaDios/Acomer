import { IsNumber, IsPositive, IsString, min } from "class-validator";

export class CreateComandaDto {
  
    @IsString()
    mesa: string;

    @IsString()
    mesero: string;

}
