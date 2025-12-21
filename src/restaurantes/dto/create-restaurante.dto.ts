import { ApiProperty } from '@nestjs/swagger';

export class CreateRestauranteDto {
    @ApiProperty({ example: 'Restaurante El Buen Sabor', description: 'Nombre del restaurante' })
    nombre: string;

    @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección del restaurante' })
    direccion: string;

    @ApiProperty({ example: '+58 412 1234567', description: 'Teléfono de contacto', required: false })
    telefono?: string;

    @ApiProperty({ example: 35.5, description: 'Tasa de cambio USD a BS', required: false })
    tasa_cambio?: number;
}
