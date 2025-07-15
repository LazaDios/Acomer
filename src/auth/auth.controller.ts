// Expondrá los endpoints HTTP para:
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

// <-- Importa los decoradores de Swagger
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth, // Para indicar que el endpoint requiere JWT
} from '@nestjs/swagger';

@ApiTags('auth') // Etiqueta el controlador para agruparlo en la UI de Swagger
@Controller('auth') // Define la ruta base para este controlador como /auth
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register') // Ruta: POST /auth/register
  @HttpCode(HttpStatus.CREATED) // Retorna un código de estado 201 Created si es exitoso
  @ApiOperation({ summary: 'Registra un nuevo usuario en la aplicación' }) // Descripción de la operación
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' }) // Posibles respuestas
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos o usuario ya existe.' })
  @ApiBody({ type: CreateUsuarioDto, description: 'Datos para registrar un nuevo usuario' }) // Documenta el cuerpo de la petición
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    this.logger.verbose(`Received registration request for username: ${createUsuarioDto.username}`);
    return this.authService.register(createUsuarioDto);
  }

  @UseGuards(LocalAuthGuard) // Aplica la guardia de autenticación local a esta ruta
  @Post('login') // Ruta: POST /auth/login
  @HttpCode(HttpStatus.OK) // Retorna un código de estado 200 OK si es exitoso
  @ApiOperation({ summary: 'Inicia sesión para obtener un token de autenticación JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Devuelve el token JWT y los datos del usuario.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        usuario: { id_usuario: 1, username: 'cristiano_ronaldo', rol: 'mesonero' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @ApiBody({ type: LoginUsuarioDto, description: 'Credenciales de usuario para iniciar sesión' })
  async login(@Request() req) {
    // Cuando LocalAuthGuard es exitoso, el usuario validado se adjunta a req.user.
    this.logger.verbose(`User ${req.user.username} successfully logged in.`);
    return this.authService.login(req.user);
  }


  // Endpoint de ejemplo para obtener el perfil del usuario autenticado. (aun no lo uso 14/07/25)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard) // Aplica la guardia de autenticación JWT a esta ruta
  @Get('profile') // Ruta: GET /auth/profile
  @ApiOperation({ summary: 'Accede al perfil que se encuentre logeado' })

  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Devuelve el token JWT y los datos del usuario.',
    schema: {
      example: {
        id_usuario: 1,
        username: 'testuser',
        rol:{
          nombre: "nombre_rol"
        },
        nombre_completo: "nombre_completo"
      
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  getProfile(@Request() req) {
    this.logger.verbose(`Profile request for user: ${req.user.username}`);
    // `req.user` contiene el payload del token JWT, que debería incluir
    // id_usuario, username, y rol.nombre, según tu JwtStrategy.
    return req.user;
  }



  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard) // Primero JWT, luego Roles
  @Roles(NombreRol.ADMINISTRADOR) // Solo los usuarios con rol 'administrador' pueden acceder
  @Get('admin-dashboard') // Ruta: GET /auth/admin-dashboard
  @ApiOperation({ summary: 'Accede al panel de administrador (solo administradores)' })
  @ApiResponse({ status: 200, description: 'Acceso concedido al panel de administrador.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  getAdminDashboard(@Request() req) {
    this.logger.verbose(`Admin dashboard accessed by user: ${req.user.username}`);
    return { message: `Bienvenido al panel de administrador, ${req.user.username}` };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR) // Solo Mesoneros y Administradores
  @Get('mesonero-dashboard') // Ruta: GET /auth/mesonero-dashboard
  @ApiOperation({ summary: 'Accede al panel de mesonero (solo mesoneros y administradores)' })
  @ApiResponse({ status: 200, description: 'Acceso concedido al panel de mesonero.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  getMesoneroDashboard(@Request() req) {
    this.logger.verbose(`Mesonero dashboard accessed by user: ${req.user.username}`);
    return { message: `Bienvenido al panel de Mesonero, ${req.user.username}` };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.COCINERO, NombreRol.ADMINISTRADOR) // Solo Cocineros y Administradores
  @Get('cocinero-dashboard') // Ruta: GET /auth/cocinero-dashboard
  @ApiOperation({ summary: 'Accede al panel de cocinero (solo cocineros y administradores)' })
  @ApiResponse({ status: 200, description: 'Acceso concedido al panel de cocinero.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  getCocineroDashboard(@Request() req) {
    this.logger.verbose(`Cocinero dashboard accessed by user: ${req.user.username}`);
    return { message: `Bienvenido al panel de Cocinero, ${req.user.username}` };
  }
}