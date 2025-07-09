//Crea estos DTOs para validar la entrada de datos cuando un usuario se registra o inicia sesión.
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO (Data Transfer Object) para el inicio de sesión de un usuario.
 * Define la estructura y las reglas de validación para las credenciales de login.
 */
export class LoginUsuarioDto {

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}