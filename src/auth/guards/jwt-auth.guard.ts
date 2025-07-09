//Crea estas guardias simples que extienden AuthGuard para aplicar las estrategias local y jwt en tus controladores.
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guardia de Autenticación JWT.
 * Extiende AuthGuard de Passport.js y especifica la estrategia 'jwt'.
 * Esta guardia se usará en las rutas que requieren que el usuario esté autenticado
 * con un token JWT válido.
 * Si el token es válido, Passport adjunta el usuario (extraído del token) a 'req.user'.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}