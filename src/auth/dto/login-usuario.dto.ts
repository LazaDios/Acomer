//Crea estos DTOs para validar la entrada de datos cuando un usuario se registra o inicia sesión.
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO (Data Transfer Object) para el inicio de sesión de un usuario.
 * Define la estructura y las reglas de validación para las credenciales de login.
 */
export class LoginUsuarioDto {

  @ApiProperty({ description: 'username del usuario', example: 'cristiano_ronaldo' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'password del usuario', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'password del usuario', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'ID del restaurante (opcional, para validar contexto)', example: 1, required: false })
  @IsOptional()
  id_restaurante?: number;
}