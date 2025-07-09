//Crea este archivo para el decorador @Roles() que usarás para marcar qué roles pueden acceder a qué rutas.
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { NombreRol } from '../entities/rol.entity'; // Importa el enum de roles

/**
 * Clave de metadatos utilizada para almacenar los roles requeridos.
 * Esta constante se utiliza internamente por el RolesGuard para buscar los roles.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador @Roles().
 * Permite especificar qué roles tienen permiso para acceder a un método
 * o a un controlador completo.
 * @param roles Una lista de 'NombreRol' permitidos para el acceso.
 *
 * Ejemplo de uso:
 * @Roles(NombreRol.ADMINISTRADOR)
 * @Roles(NombreRol.MESONERO, NombreRol.COCINERO)
 */
export const Roles = (...roles: NombreRol[]) => SetMetadata(ROLES_KEY, roles);