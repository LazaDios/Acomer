//Este DTO se usará para validar los datos que recibes cuando alguien intenta registrar un nuevo usuario.
import { IsString, IsNotEmpty, IsInt, MinLength } from 'class-validator';

/**
 * DTO (Data Transfer Object) para la creación de un nuevo usuario.
 * Define la estructura y las reglas de validación para los datos de entrada
 * al registrar un usuario.
 */
export class CreateUsuarioDto {

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @IsInt()
  @IsNotEmpty()
  rolId: number; // Este será el id_rol de la entidad Rol
}