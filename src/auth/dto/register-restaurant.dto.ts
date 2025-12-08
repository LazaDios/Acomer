import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRestaurantDto {
    @ApiProperty({ example: 'Restaurante El Buen Sabor', description: 'Nombre del restaurante' })
    @IsString()
    @IsNotEmpty()
    restaurantName: string;

    @ApiProperty({ example: 'usuario_admin', description: 'Nombre de usuario para el administrador' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: '12345678', description: 'Cédula del administrador' })
    @IsString()
    @IsNotEmpty()
    cedula: string;

    @ApiProperty({ example: 'juan@example.com', description: 'Correo electrónico (Gmail)' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Contraseña para la cuenta de administrador' })
    @IsString()
    @MinLength(6)
    password: string;
}
