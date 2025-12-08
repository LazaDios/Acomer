import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, Logger, OnModuleInit, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from './entities/usuario.entity';
import { Rol, NombreRol } from './entities/rol.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RestaurantesService } from '../restaurantes/restaurantes.service';
import { RegisterRestaurantDto } from './dto/register-restaurant.dto';
import { Restaurante } from '../restaurantes/entities/restaurante.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>,
    private jwtService: JwtService,
    private restaurantesService: RestaurantesService,
  ) { }

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles() {
    this.logger.log('Verificando roles iniciales...');
    const roles = [
      { id: 1, nombre: NombreRol.ADMINISTRADOR },
      { id: 2, nombre: NombreRol.MESONERO },
      { id: 3, nombre: NombreRol.COCINERO },
    ];

    for (const roleData of roles) {
      const existingRole = await this.rolesRepository.findOne({ where: { nombre: roleData.nombre } });
      if (!existingRole) {
        this.logger.log(`Creando rol: ${roleData.nombre}`);
        const newRole = this.rolesRepository.create({
          nombre: roleData.nombre
        });
        await this.rolesRepository.save(newRole);
      }
    }
    this.logger.log('Roles verificados.');
  }

  async register(createUsuarioDto: CreateUsuarioDto, authenticatedUser?: any): Promise<Usuario> {
    const { username, password, nombre_completo, rolId } = createUsuarioDto;

    const existingUser = await this.usuariosRepository.findOne({ where: { username } });
    if (existingUser) {
      this.logger.warn(`Intento de registro con username existente: ${username}`);
      throw new BadRequestException('El nombre de usuario ya existe.');
    }

    const rol = await this.rolesRepository.findOne({ where: { id_rol: rolId } });
    if (!rol) {
      this.logger.error(`Intento de registro con rol ID no encontrado: ${rolId}`);
      throw new NotFoundException(`Rol con ID ${rolId} no encontrado.`);
    }

    // Obtener el restaurante del usuario autenticado si existe
    let restauranteId: number | undefined;
    if (authenticatedUser?.id_restaurante) {
      restauranteId = authenticatedUser.id_restaurante;
    }

    const nuevoUsuario = this.usuariosRepository.create({
      username,
      password,
      nombre_completo,
      rol_id: rolId,
      rol,
      ...(restauranteId && { id_restaurante: restauranteId }),
    });

    await nuevoUsuario.hashPassword();
    this.logger.log(`Usuario ${username} registrado exitosamente con rol ${rol.nombre} y restaurante ${restauranteId || 'ninguno'}.`);
    return this.usuariosRepository.save(nuevoUsuario);
  }

  async validateUser(username: string, password_plain: string): Promise<Usuario | null> {
    const usuario = await this.usuariosRepository.findOne({
      where: { username },
      relations: ['restaurante', 'rol']
    });

    if (usuario && (await usuario.comparePassword(password_plain))) {
      this.logger.debug(`Usuario ${username} validado correctamente.`);
      return usuario;
    }
    this.logger.warn(`Fallo de validación para el usuario: ${username}`);
    return null;
  }

  async login(usuario: Usuario, restauranteId?: number) {
    // Si viene un id desde el frontend, verificamos que coincida.
    if (restauranteId) {
      const rId = Number(restauranteId);
      // El usuario debe tener ese id_restaurante asociado
      if (usuario.id_restaurante !== rId) {
        // Por seguridad (para no revelar que el usuario existe en otro restaurante),
        // devolvemos un mensaje genérico de credenciales inválidas.
        throw new UnauthorizedException('Credenciales inválidas.');
      }
    }

    const payloadRestauranteId = usuario.restaurante?.id_restaurante || usuario.id_restaurante;

    // Buscamos el objeto restaurante completo si no viene cargado
    let fullRestaurant: Restaurante | null | undefined = usuario.restaurante;
    if (!fullRestaurant && payloadRestauranteId) {
      const found = await this.restaurantesService.findOne(payloadRestauranteId);
      // Si findOne retorna "Restaurante | null" o similar, lo asignamos.
      fullRestaurant = found || null;
    }

    const payload = {
      username: usuario.username,
      id_usuario: usuario.id_usuario,
      rol: usuario.rol.nombre,
      restaurante_id: payloadRestauranteId,
    };
    this.logger.log(`Generando token JWT para el usuario: ${usuario.username} (Restaurante: ${payloadRestauranteId})`);

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        nombre_completo: usuario.nombre_completo,
        rol: usuario.rol.nombre,
        restaurante_id: payloadRestauranteId,
      },
      restaurant: fullRestaurant // Retornamos el objeto completo para el frontend
    };
  }

  async findById(id: number) {
    return this.usuariosRepository.findOne({ where: { id_usuario: id } });
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    const { token } = googleLoginDto;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Token de Google inválido (sin payload)');
      }

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name;

      if (!email) {
        throw new BadRequestException('El token de Google no contiene email');
      }

      let user = await this.usuariosRepository.findOne({ where: { google_id: googleId } });

      if (!user) {
        user = await this.usuariosRepository.findOne({ where: { email } });
        if (user) {
          user.google_id = googleId;
          await this.usuariosRepository.save(user);
        }
      }

      if (!user) {
        const rolAdmin = await this.rolesRepository.findOne({ where: { nombre: NombreRol.ADMINISTRADOR } });

        if (!rolAdmin) {
          throw new NotFoundException('Rol ADMINISTRADOR no encontrado en la base de datos');
        }

        // 1. Crear el Usuario Dueño (Google User) - SIN restaurante todavía
        user = this.usuariosRepository.create({
          email,
          google_id: googleId,
          nombre_completo: name || 'Usuario Google',
          username: email.split('@')[0],
          rol: rolAdmin,
          rol_id: rolAdmin.id_rol,
          password: undefined,
        });

        await this.usuariosRepository.save(user);

        // 2. Crear Restaurante
        const nombreRestaurante = `Restaurante de ${name || 'Usuario'}`;
        const nuevoRestaurante = await this.restaurantesService.create({
          nombre: nombreRestaurante,
          direccion: 'Dirección pendiente',
          telefono: '',
        }, user);

        // 2.1 ACTUALIZAR el usuario con el restaurante_id
        user.id_restaurante = nuevoRestaurante.id_restaurante;
        user.restaurante = nuevoRestaurante;
        await this.usuariosRepository.save(user);
        this.logger.log(`Usuario Google actualizado con restaurante_id: ${nuevoRestaurante.id_restaurante}`);

        // 3. Crear Usuario Admin Local (admin_[id])
        const localAdminUsername = `admin_${nuevoRestaurante.id_restaurante}`;
        const localAdminPassword = 'admin';

        const localAdmin = this.usuariosRepository.create({
          username: localAdminUsername,
          email: `admin_${nuevoRestaurante.id_restaurante}@local.com`,
          nombre_completo: 'Administrador Local',
          rol: rolAdmin,
          rol_id: rolAdmin.id_rol,
          restaurante: nuevoRestaurante,
          id_restaurante: nuevoRestaurante.id_restaurante,
          password: localAdminPassword
        });

        await localAdmin.hashPassword();
        await this.usuariosRepository.save(localAdmin);

        // Retornamos info extra para el frontend
        const loginResponse = await this.login(user);
        return {
          ...loginResponse,
          restaurant: nuevoRestaurante,
          localAdmin: {
            username: localAdminUsername,
            password: localAdminPassword
          }
        };
      }

      // Si el usuario ya existe, verificamos si tiene restaurante
      const loginResponse = await this.login(user);

      const userWithRestaurante = await this.usuariosRepository.findOne({
        where: { id_usuario: user.id_usuario },
        relations: ['restaurante']
      });

      return {
        ...loginResponse,
        restaurant: userWithRestaurante?.restaurante || null
      };

    } catch (error) {
      this.logger.error(`Error verificando token de Google: ${error.message}`);
      throw new UnauthorizedException('Token de Google inválido');
    }
  }

  async registerRestaurant(registerRestaurantDto: RegisterRestaurantDto) {
    const { restaurantName, username, cedula, email, password } = registerRestaurantDto;

    // 1. Verificar si el email o username ya existen
    const existingEmail = await this.usuariosRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }
    const existingUser = await this.usuariosRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestException('El nombre de usuario ya está registrado.');
    }

    const rolAdmin = await this.rolesRepository.findOne({ where: { nombre: NombreRol.ADMINISTRADOR } });
    if (!rolAdmin) {
      throw new NotFoundException('Rol ADMINISTRADOR no encontrado.');
    }

    // 2. Crear Usuario Admin (Dueño) - SIN restaurante todavía
    const adminUser = this.usuariosRepository.create({
      email,
      username,
      cedula,
      nombre_completo: username, // Usamos username como nombre por defecto si no se pide nombre completo
      rol: rolAdmin,
      rol_id: rolAdmin.id_rol,
      password: password,
    });
    await adminUser.hashPassword();
    await this.usuariosRepository.save(adminUser);

    // 3. Crear Restaurante
    const nuevoRestaurante = await this.restaurantesService.create({
      nombre: restaurantName,
      direccion: 'Dirección pendiente',
      telefono: '',
    }, adminUser);

    // 3.1 ACTUALIZAR el adminUser con el restaurante_id
    adminUser.id_restaurante = nuevoRestaurante.id_restaurante;
    adminUser.restaurante = nuevoRestaurante;
    await this.usuariosRepository.save(adminUser);
    this.logger.log(`Admin (Dueño) actualizado con restaurante_id: ${nuevoRestaurante.id_restaurante}`);

    // 4. Login automático
    const loginResponse = await this.login(adminUser);

    return {
      ...loginResponse,
      restaurant: nuevoRestaurante,
      user: {
        id: adminUser.id_usuario,
        username: adminUser.username,
        role: adminUser.rol.nombre
      }
    };
  }
}