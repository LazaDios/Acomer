//Esta guardia usará el Reflector de NestJS para leer los roles definidos por @Roles() y compararlos con el rol del usuario autenticado (obtenido del JWT).
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // Importa Reflector para leer metadatos
import { NombreRol } from '../entities/rol.entity'; // Importa el enum de roles
import { ROLES_KEY } from '../decorators/roles.decorator'; // Importa la clave de los metadatos de roles

/**
 * Guardia de Roles.
 * Implementa CanActivate para determinar si la solicitud actual
 * puede ser procesada por el controlador/método.
 * Se utiliza junto con JwtAuthGuard y el decorador @Roles().
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {} // Inyecta Reflector

  /**
   * Determina si la solicitud es permitida basada en los roles del usuario.
   * @param context El contexto de ejecución actual (incluye información de la solicitud).
   * @returns Verdadero si el usuario tiene el rol requerido, falso en caso contrario.
   */
  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos para la ruta/método
    // getAllAndOverride busca metadatos en el método y en la clase.
    const requiredRoles = this.reflector.getAllAndOverride<NombreRol[]>(ROLES_KEY, [
      context.getHandler(), // Intenta obtener roles del método
      context.getClass(),   // Luego, si no los encuentra, los busca en la clase (controlador)
    ]);

    // Si no se especifican roles para esta ruta, permite el acceso (no hay restricción de roles)
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario autenticado del request
    // Asume que JwtAuthGuard ya se ejecutó y adjuntó el usuario a 'req.user'.
    const { user } = context.switchToHttp().getRequest();

    // 3. Validar si el usuario y su rol existen
    if (!user || !user.rol || !user.rol.nombre) {
        // Esto puede ocurrir si el token JWT no contenía la información del rol
        // o si el JwtStrategy no la adjuntó correctamente.
        throw new UnauthorizedException('Información de rol del usuario no disponible.');
    }

    // 4. Verificar si el rol del usuario está entre los roles requeridos
    // 'some' retorna true si al menos uno de los roles requeridos coincide con el rol del usuario.
    const hasRequiredRole = requiredRoles.some((role) => user.rol.nombre === role);

    if (!hasRequiredRole) {
        // Puedes lanzar una ForbiddenException aquí si quieres un mensaje de error 403 claro
        // throw new ForbiddenException('No tienes el rol necesario para acceder a esta ruta.');
        return false; // Niega el acceso si el rol no coincide
    }

    return true; // Permite el acceso
  }
}