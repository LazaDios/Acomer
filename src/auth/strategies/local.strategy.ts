//Implementa la estrategia de autenticación Local de Passport.js. 
// Se usará para el proceso de inicio de sesión (username y password). 
// Delegará la validación al AuthService.
import { Strategy } from 'passport-local'; // Importa la estrategia Local de passport-local
import { PassportStrategy } from '@nestjs/passport'; // Utilidad de NestJS para estrategias de Passport
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service'; // Importa tu AuthService para validar credenciales

/**
 * Estrategia de autenticación local.
 * Se encarga de validar el nombre de usuario y la contraseña proporcionados
 * durante el proceso de inicio de sesión.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Llama al constructor de la clase base (Strategy de passport-local)
    // No necesita opciones aquí si los campos son 'username' y 'password' por defecto.
    // Si tus campos se llamaran diferente (ej. 'email', 'pass'), los especificarías aquí:
    // super({ usernameField: 'email', passwordField: 'pass' });
    super();
  }

  /**
   * Método de validación de la estrategia local.
   * Passport.js llama a este método con el nombre de usuario y la contraseña del request.
   * @param username El nombre de usuario enviado en la petición de login.
   * @param password_plain La contraseña en texto plano enviada en la petición de login.
   * @returns El objeto de usuario si las credenciales son válidas, de lo contrario lanza una excepción.
   */
  async validate(username: string, password_plain: string): Promise<any> {
    // Delega la validación real de las credenciales al AuthService
    const usuario = await this.authService.validateUser(username, password_plain);

    // Si el usuario no es encontrado o las credenciales son inválidas
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Si la validación es exitosa, retorna el usuario.
    // Es buena práctica omitir la contraseña hasheada aquí por seguridad.
    // Passport.js adjuntará este objeto a `req.user`.
    const { password, ...result } = usuario; // Desestructura para omitir la contraseña
    return result;
  }
}