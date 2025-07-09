//Implementa la estrategia JWT de Passport.js. 
//Se usará para validar tokens JWT en cada petición posterior al login.
//Extraerá la información del usuario del token.

import { ExtractJwt, Strategy } from 'passport-jwt'; // Importa la estrategia JWT y el extractor
import { PassportStrategy } from '@nestjs/passport'; // Utilidad de NestJS para estrategias de Passport
import { Injectable, /*UnauthorizedException*/ } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Importa ConfigService para acceder a variables de entorno
import { Usuario } from '../entities/usuario.entity'; // Importa la entidad Usuario

/**
 * Estrategia de autenticación JWT.
 * Se encarga de extraer y validar el JSON Web Token (JWT) de las peticiones entrantes.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService // Inyecta ConfigService
  ) {
    // Llama al constructor de la clase base (Strategy de passport-jwt)
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!, // Obtenemos el secreto de la variable de entorno
    });
  }

  /**
   * Método de validación de la estrategia JWT.
   * Passport.js llama a este método con el 'payload' decodificado del token JWT.
   * @param payload La carga útil (payload) del token JWT decodificado.
   * Contendrá la información que pusiste en el token (id_usuario, username, rol.nombre).
   * @returns El objeto de usuario que se adjuntará a `req.user`.
   * Puedes retornar un objeto simple o buscar el usuario completo en la DB si necesitas más datos.
   */
  async validate(payload: any): Promise<Usuario> {
    // Puedes (opcionalmente) buscar el usuario en la base de datos aquí
    // para asegurarte de que el usuario todavía existe y no ha sido deshabilitado, etc.
    // const user = await this.authService.findById(payload.id_usuario);
    // if (!user) {
    //   throw new UnauthorizedException('Usuario no encontrado o deshabilitado.');
    // }
    // return user;

    // Por simplicidad y rendimiento, a menudo se retorna directamente la información del payload
    // que ya tenemos del token, asumiendo que es suficiente para la autorización.
    // Asegúrate de que el tipo de retorno coincida con la estructura esperada por tu aplicación.
    return {
      id_usuario: payload.id_usuario,
      username: payload.username,
      // Asegúrate de que `payload.rol` contiene el nombre del rol (ej. "mesonero")
      // Esto es crucial para que `RolesGuard` funcione correctamente.
      rol: { nombre: payload.rol }, // Reconstruimos el objeto rol simplificado para que RolesGuard pueda acceder a `user.rol.nombre`
      // Añade cualquier otra propiedad del payload que necesites directamente en `req.user`
      nombre_completo: payload.nombre_completo || 'N/A', // Asume que puede estar o no en el payload
    } as Usuario; // Casteamos a Usuario para mantener la consistencia de tipos
  }
}