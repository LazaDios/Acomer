//Aquí irá la lógica principal de negocio para la autenticación:
//Registrar nuevos usuarios (incluyendo el hasheo de contraseñas).
//Validar credenciales de usuario (comparar contraseñas).
// src/auth/auth.service.ts
import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt'; // Para generar tokens JWT
import { Usuario } from './entities/usuario.entity';
import { Rol, NombreRol } from './entities/rol.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>,
    private jwtService: JwtService, // Inyectamos JwtService
  ) {}

  /**
   * Registra un nuevo usuario en el sistema.
   * @param createUsuarioDto Datos para la creación del usuario.
   * @returns El usuario recién creado.
   * @throws BadRequestException si el nombre de usuario ya existe.
   * @throws NotFoundException si el rol especificado no existe.
   */
  async register(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { username, password, nombre_completo, rolId } = createUsuarioDto;

    // Verificar si el nombre de usuario ya existe
    const existingUser = await this.usuariosRepository.findOne({ where: { username } });
    if (existingUser) {
      this.logger.warn(`Intento de registro con username existente: ${username}`);
      throw new BadRequestException('El nombre de usuario ya existe.');
    }

    // Buscar el rol por su ID
    const rol = await this.rolesRepository.findOne({ where: { id_rol: rolId } });
    if (!rol) {
      this.logger.error(`Intento de registro con rol ID no encontrado: ${rolId}`);
      throw new NotFoundException(`Rol con ID ${rolId} no encontrado.`);
    }

    // Crear la instancia del nuevo usuario
    const nuevoUsuario = this.usuariosRepository.create({
      username,
      password, // La contraseña se hasheará antes de guardar
      nombre_completo,
      rol_id: rolId,
      rol, // Asignar el objeto rol completo
    });

    // Hashear la contraseña antes de guardar
    await nuevoUsuario.hashPassword();
    this.logger.log(`Usuario ${username} registrado exitosamente con rol ${rol.nombre}.`);
    return this.usuariosRepository.save(nuevoUsuario);
  }

  /**
   * Valida las credenciales de un usuario.
   * Utilizado por la estrategia 'local' de Passport.
   * @param username Nombre de usuario.
   * @param password_plain Contraseña en texto plano.
   * @returns El usuario validado (sin la contraseña) o null si las credenciales son inválidas.
   */
  async validateUser(username: string, password_plain: string): Promise<Usuario | null> {
    const usuario = await this.usuariosRepository.findOne({ where: { username } });

    if (usuario && (await usuario.comparePassword(password_plain))) {
      // Si el usuario existe y la contraseña coincide, retorna el usuario.
      // Es buena práctica no retornar la contraseña hasheada fuera de aquí.
      this.logger.debug(`Usuario ${username} validado correctamente.`);
      return usuario;
    }
    this.logger.warn(`Fallo de validación para el usuario: ${username}`);
    return null; // Credenciales inválidas
  }

  /**
   * Genera un token JWT para un usuario autenticado.
   * @param usuario El objeto Usuario autenticado.
   * @returns Un objeto que contiene el token de acceso JWT y la información básica del usuario.
   */
  async login(usuario: Usuario) {
    // Define el 'payload' (carga útil) que se incluirá en el token JWT.
    // Es importante incluir la información necesaria para la autorización (ej. rol).
    const payload = {
      username: usuario.username,
      id_usuario: usuario.id_usuario,
      rol: usuario.rol.nombre, // Incluimos el nombre del rol en el token
    };

    this.logger.log(`Generando token JWT para el usuario: ${usuario.username}`);
    return {
      access_token: this.jwtService.sign(payload), // Firma el payload para crear el token
      usuario: {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        nombre_completo: usuario.nombre_completo,
        rol: usuario.rol.nombre,
      }
    };
  }

  /**
   * Encuentra un usuario por su ID.
   * Útil para la estrategia JWT, para reconstruir el objeto de usuario si es necesario.
   * @param id El ID del usuario.
   * @returns El usuario encontrado o undefined si no existe.
   */
  async findById(id: number) /*: Promise<Usuario | undefined>*/ {
    return this.usuariosRepository.findOne({ where: { id_usuario: id } });
  }
}