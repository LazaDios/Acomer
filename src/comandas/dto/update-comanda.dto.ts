import { PartialType } from '@nestjs/mapped-types';
import { CreateComandaDto } from './create-comanda.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoComanda } from 'src/common/enums/comanda-estado.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateComandaDto extends PartialType(CreateComandaDto) {
    @ApiProperty({
        description: 'Nuevo estado de la comanda (solo para actualizaciones de estado específicas)',
        enum: EstadoComanda, // Indica que es un enum y muestra sus valores posibles
        example: EstadoComanda.PREPARANDO, // Un ejemplo de valor
        required: false, // Es un campo opcional para la actualización
    })
    @IsOptional()
    @IsEnum(EstadoComanda, { message: 'El estado no es un valor válido.' })
    estado_comanda: EstadoComanda; // El estado es opcional para actualizar, ya que no siempre se cambia
}
