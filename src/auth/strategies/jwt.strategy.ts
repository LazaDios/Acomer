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
    return {
      id_usuario: payload.id_usuario,
      username: payload.username,
      rol: { nombre: payload.rol },
      id_restaurante: payload.restaurante_id,
      nombre_completo: payload.nombre_completo || 'N/A',
    } as Usuario;
  }
}