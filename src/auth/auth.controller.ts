//Expondrá los endpoints HTTP para:
// POST /auth/register (para crear nuevos usuarios).
// POST /auth/login (para que los usuarios obtengan su JWT).
// GET /auth/profile (un ejemplo de ruta protegida para obtener el perfil del usuario autenticado).
import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto'; // Aunque no se usa directamente para @Body, es útil para la documentación/claridad.
import { LocalAuthGuard } from './guards/local-auth.guard'; // Importa la guardia de autenticación local
import { JwtAuthGuard } from './guards/jwt-auth.guard';     // Importa la guardia de autenticación JWT
import { RolesGuard } from './guards/roles.guard';         // Importa la guardia de roles
import { Roles } from './decorators/roles.decorator';      // Importa el decorador de roles
import { NombreRol } from './entities/rol.entity';         // Importa el enum de roles

@Controller('auth') // Define la ruta base para este controlador como /auth
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  /**
   * Endpoint para registrar un nuevo usuario.
   * @param createUsuarioDto DTO con los datos del nuevo usuario (username, password, nombre_completo, rolId).
   * @returns El usuario registrado (sin la contraseña hasheada).
   */
  @Post('register') // Ruta: POST /auth/register
  @HttpCode(HttpStatus.CREATED) // Retorna un código de estado 201 Created si es exitoso
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    this.logger.verbose(`Received registration request for username: ${createUsuarioDto.username}`);
    return this.authService.register(createUsuarioDto);
  }

  /**
   * Endpoint para que un usuario inicie sesión y obtenga un JWT.
   * Utiliza LocalAuthGuard para validar las credenciales (username/password).
   * @param req El objeto de la petición, que contendrá el usuario validado por LocalAuthGuard en `req.user`.
   * @returns Un objeto que contiene el token de acceso JWT y la información básica del usuario.
   */
  @UseGuards(LocalAuthGuard) // Aplica la guardia de autenticación local a esta ruta
  @Post('login') // Ruta: POST /auth/login
  @HttpCode(HttpStatus.OK) // Retorna un código de estado 200 OK si es exitoso
  async login(@Request() req) {
    // Cuando LocalAuthGuard es exitoso, el usuario validado se adjunta a req.user.
    this.logger.verbose(`User ${req.user.username} successfully logged in.`);
    return this.authService.login(req.user);
  }

  /**
   * Endpoint de ejemplo para obtener el perfil del usuario autenticado.
   * Esta ruta está protegida por JWTAuthGuard, lo que significa que requiere
   * un token JWT válido en el encabezado de autorización.
   * @param req El objeto de la petición, que contendrá el usuario (del token JWT) en `req.user`.
   * @returns La información del perfil del usuario autenticado.
   */
  @UseGuards(JwtAuthGuard) // Aplica la guardia de autenticación JWT a esta ruta
  @Get('profile') // Ruta: GET /auth/profile
  getProfile(@Request() req) {
    this.logger.verbose(`Profile request for user: ${req.user.username}`);
    // `req.user` contiene el payload del token JWT, que debería incluir
    // id_usuario, username, y rol.nombre, según tu JwtStrategy.
    return req.user;
  }

  /**
   * Ejemplo de una ruta protegida con JWT y restringida a roles específicos (solo Administradores).
   * Muestra cómo combinar JwtAuthGuard y RolesGuard.
   * @param req El objeto de la petición.
   * @returns Un mensaje de bienvenida si el usuario es un Administrador.
   */
  @UseGuards(JwtAuthGuard, RolesGuard) // Primero JWT, luego Roles
  @Roles(NombreRol.ADMINISTRADOR) // Solo los usuarios con rol 'administrador' pueden acceder
  @Get('admin-dashboard') // Ruta: GET /auth/admin-dashboard
  getAdminDashboard(@Request() req) {
    this.logger.verbose(`Admin dashboard accessed by user: ${req.user.username}`);
    return { message: `Bienvenido al panel de administrador, ${req.user.username}` };
  }

  /**
   * Ejemplo de una ruta protegida con JWT y restringida a roles de Mesonero o Administrador.
   * @param req El objeto de la petición.
   * @returns Un mensaje de bienvenida si el usuario es un Mesonero o Administrador.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR) // Solo Mesoneros y Administradores
  @Get('mesonero-dashboard') // Ruta: GET /auth/mesonero-dashboard
  getMesoneroDashboard(@Request() req) {
    this.logger.verbose(`Mesonero dashboard accessed by user: ${req.user.username}`);
    return { message: `Bienvenido al panel de Mesonero, ${req.user.username}` };
  }

  /**
   * Ejemplo de una ruta protegida con JWT y restringida a roles de Cocinero o Administrador.
   * @param req El objeto de la petición.
   * @returns Un mensaje de bienvenida si el usuario es un Cocinero o Administrador.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.COCINERO, NombreRol.ADMINISTRADOR) // Solo Cocineros y Administradores
  @Get('cocinero-dashboard') // Ruta: GET /auth/cocinero-dashboard
  getCocineroDashboard(@Request() req) {
    this.logger.verbose(`Cocinero dashboard accessed by user: ${req.user.username}`);
    return { message: `Bienvenido al panel de Cocinero, ${req.user.username}` };
  }
}