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
  constructor(private reflector: Reflector) { } // Inyecta Reflector

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
    if (!user || !user.rol) {
      throw new UnauthorizedException('Información de rol del usuario no disponible.');
    }

    // Extraer el nombre del rol (puede venir del objeto o ser un string directo)
    const userRoleName = (typeof user.rol === 'object' ? user.rol.nombre : user.rol);

    if (!userRoleName) {
      throw new UnauthorizedException('El nombre del rol es inválido o no está presente.');
    }

    // 4. Verificar si el rol del usuario está entre los roles requeridos
    const hasRequiredRole = requiredRoles.some((role) => userRoleName === role);

    if (!hasRequiredRole) {
      return false;
    }

    return true;
  }
}