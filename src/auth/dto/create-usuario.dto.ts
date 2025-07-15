//Este DTO se usará para validar los datos que recibes cuando alguien intenta registrar un nuevo usuario.
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, MinLength } from 'class-validator';

/**
 * DTO (Data Transfer Object) para la creación de un nuevo usuario.
 * Define la estructura y las reglas de validación para los datos de entrada
 * al registrar un usuario.
 */
export class CreateUsuarioDto {
  @ApiProperty({ description: 'username del usuario', example: 'cristiano_ronaldo' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'password del usuario', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Transform(({ value }) => value.trim())
  password: string;

  @ApiProperty({ description: 'nombre completo del usuario', example: 'cristiano ronaldo aveiro' })
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

   @ApiProperty({ description: 'Rol de usuario [1,2,3]', example: 1 })
  @IsInt()
  @IsNotEmpty()
  rolId: number; // Este será el id_rol de la entidad Rol
}