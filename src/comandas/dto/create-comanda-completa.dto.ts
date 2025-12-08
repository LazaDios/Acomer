import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DetalleItemDto } from '../../detalle-comandas/dto/create-detalle-comanda.dto';

export class CreateComandaCompletaDto {
    @ApiProperty({ description: 'El numero de mesa', example: '01' })
    @IsString()
    @IsNotEmpty()
    mesa: string;

    @ApiProperty({
        description: 'Array de detalles de la comanda',
        type: [DetalleItemDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetalleItemDto)
    detalles: DetalleItemDto[];
}
