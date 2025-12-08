import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RegisterRestaurantDto } from './dto/register-restaurant.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { NombreRol } from './entities/rol.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) { }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra un nuevo usuario en la aplicación' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos o usuario ya existe.' })
  @ApiBody({ type: CreateUsuarioDto, description: 'Datos para registrar un nuevo usuario' })
  async register(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req) {
    this.logger.verbose(`Received registration request for username: ${createUsuarioDto.username}`);
    // Aseguramos que pasamos el usuario con el id_restaurante correcto
    return this.authService.register(createUsuarioDto, req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia sesión para obtener un token de autenticación JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Devuelve el token JWT y los datos del usuario.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @ApiBody({ type: LoginUsuarioDto, description: 'Credenciales de usuario para iniciar sesión' })
  async login(@Body() loginUsuarioDto: LoginUsuarioDto, @Request() req) {
    this.logger.verbose(`User ${req.user.username} successfully logged in.`);
    // Pasamos el DTO para que el servicio pueda validar el id_restaurante si viene
    return this.authService.login(req.user, loginUsuarioDto.id_restaurante);
  }

  @Post('google-login')
  @ApiOperation({ summary: 'Login con Google' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.googleLogin(googleLoginDto);
  }

  @Post('register-restaurant')
  @ApiOperation({ summary: 'Registrar nuevo restaurante y dueño' })
  @ApiResponse({ status: 201, description: 'Restaurante creado exitosamente.' })
  async registerRestaurant(@Body() registerRestaurantDto: RegisterRestaurantDto) {
    return this.authService.registerRestaurant(registerRestaurantDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Accede al perfil que se encuentre logeado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  getProfile(@Request() req) {
    this.logger.verbose(`Profile request for user: ${req.user.username}`);
    return req.user;
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.ADMINISTRADOR)
  @Get('admin-dashboard')
  @ApiOperation({ summary: 'Accede al panel de administrador (solo administradores)' })
  @ApiResponse({ status: 200, description: 'Acceso concedido al panel de administrador.' })
  getAdminDashboard(@Request() req) {
    this.logger.verbose(`Admin dashboard accessed by user: ${req.user.username}`);
    return { message: `Bienvenido al panel de administrador, ${req.user.username}` };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR)
  @Get('mesonero-dashboard')
  @ApiOperation({ summary: 'Accede al panel de mesonero (solo mesoneros y administradores)' })
  @ApiResponse({ status: 200, description: 'Acceso concedido al panel de mesonero.' })
  getMesoneroDashboard(@Request() req) {
    this.logger.verbose(`Mesonero dashboard accessed by user: ${req.user.username}`);
    return { message: `Bienvenido al panel de Mesonero, ${req.user.username}` };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.COCINERO, NombreRol.ADMINISTRADOR)
  @Get('cocinero-dashboard')
  @ApiOperation({ summary: 'Accede al panel de cocinero (solo cocineros y administradores)' })
  @ApiResponse({ status: 200, description: 'Acceso concedido al panel de cocinero.' })
  getCocineroDashboard(@Request() req) {
    this.logger.verbose(`Cocinero dashboard accessed by user: ${req.user.username}`);
    return { message: `Bienvenido al panel de Cocinero, ${req.user.username}` };
  }
}