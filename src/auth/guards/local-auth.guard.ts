//Crea estas guardias simples que extienden AuthGuard para aplicar las estrategias local y jwt en tus controladores.
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Importa AuthGuard de @nestjs/passport

/**
 * Guardia de Autenticación Local.
 * Extiende AuthGuard de Passport.js y especifica la estrategia 'local'.
 * Esta guardia se usará en el endpoint de inicio de sesión (login)
 * para validar las credenciales de usuario/contraseña.
 * Si la validación es exitosa, Passport adjunta el usuario a 'req.user'.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}