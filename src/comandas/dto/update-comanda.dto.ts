import { PartialType } from '@nestjs/mapped-types';
import { CreateComandaDto } from './create-comanda.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoComanda } from 'src/common/enums/comanda-estado.enum';

export class UpdateComandaDto extends PartialType(CreateComandaDto) {
    @IsOptional()
    @IsEnum(EstadoComanda, { message: 'El estado no es un valor válido.' })
    estado_comanda: EstadoComanda; // El estado es opcional para actualizar, ya que no siempre se cambia
}
