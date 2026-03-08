import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Rol, NombreRol } from './entities/rol.entity';
import { RestaurantesService } from '../restaurantes/restaurantes.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolesRepository: Repository<Rol>,
    private readonly jwtService: JwtService,
    private readonly restaurantesService: RestaurantesService,
  ) { }

  async register(createUsuarioDto: CreateUsuarioDto, requestUser?: any) {
    const { password, rol_id, ...userData } = createUsuarioDto;

    const existingUser = await this.usuariosRepository.findOneBy({ username: userData.username });
    if (existingUser) {
      throw new BadRequestException('El usuario ya existe');
    }

    const rol = await this.rolesRepository.findOneBy({ id_rol: rol_id });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usuariosRepository.create({
      ...userData,
      password: hashedPassword,
      rol_id: rol.id_rol,
      id_restaurante: requestUser?.id_restaurante // Usamos el nombre viejo
    });

    const savedUser = await this.usuariosRepository.save(user);
    const { password: _, ...result } = savedUser;
    return result;
  }

  async login(user: any, id_restaurante?: number) {
    if (id_restaurante && user.id_restaurante !== id_restaurante) {
      throw new UnauthorizedException('No tienes permiso para acceder a este restaurante.');
    }

    // --- DETECCIÓN DE ROL ULTRA-ROBUSTA ---
    let nombreRol = '';

    if (user.rol?.nombre) {
      nombreRol = user.rol.nombre;
    } else if (typeof user.rol === 'string') {
      nombreRol = user.rol;
    } else {
      // Si no viene el rol cargado, lo buscamos manualmente por el ID
      const rolId = user.rol_id;
      this.logger.debug(`Buscando nombre de rol para ID: ${rolId}`);
      const rolEncontrado = await this.rolesRepository.findOneBy({ id_rol: rolId });
      nombreRol = rolEncontrado?.nombre || '';
    }

    // Normalizar y fallback
    nombreRol = nombreRol.toLowerCase().trim();
    if (!nombreRol) {
      this.logger.warn(`¡ADVERTENCIA! No se encontró rol para el usuario ${user.username}. Usando 'mesonero' por defecto.`);
      nombreRol = 'mesonero';
    }

    this.logger.log(`LOGIN EXITOSO: Usuario=${user.username}, Rol detectado=${nombreRol}`);

    const payload = {
      username: user.username,
      sub: user.id_usuario,
      rol: nombreRol,
      id_restaurante: user.id_restaurante,
      nombre_completo: user.nombre_completo
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario: user.id_usuario,
        username: user.username,
        email: user.email,
        nombre_completo: user.nombre_completo,
        rol: nombreRol,
        id_restaurante: user.id_restaurante,
      },
      restaurant: user.restaurante || null,
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usuariosRepository.findOne({
      where: { username },
      relations: ['rol', 'restaurante'],
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async registerRestaurant(data: any) {
    const { email, username, password, restaurantName } = data;

    const existingUser = await this.usuariosRepository.findOne({
      where: [{ username }, { email }]
    });

    if (existingUser) {
      throw new BadRequestException('El nombre de usuario o email ya está registrado.');
    }

    const rolAdmin = await this.rolesRepository.findOne({ where: { nombre: NombreRol.ADMINISTRADOR } });
    if (!rolAdmin) {
      throw new NotFoundException('Rol ADMINISTRADOR no encontrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = this.usuariosRepository.create({
      email,
      username,
      nombre_completo: username,
      rol_id: rolAdmin.id_rol,
      password: hashedPassword,
    });

    await this.usuariosRepository.save(adminUser);

    try {
      const nuevoRestaurante = await this.restaurantesService.create({
        nombre: restaurantName,
        direccion: 'Dirección pendiente',
        telefono: '',
      });

      adminUser.id_restaurante = nuevoRestaurante.id_restaurante;
      adminUser.restaurante = nuevoRestaurante; // Asignamos el objeto completo para que el login lo devuelva
      await this.usuariosRepository.save(adminUser);

      this.logger.log(`Restaurante "${restaurantName}" registrado con éxito (id: ${nuevoRestaurante.id_restaurante}).`);

      return this.login(adminUser);

    } catch (error) {
      this.logger.error(`Error en registro: ${error.message}`);
      throw error;
    }
  }

  async findAllByRestaurant(id_restaurante: number) {
    return this.usuariosRepository.find({
      where: { id_restaurante },
      relations: ['rol']
    });
  }

  async remove(id: number, id_restaurante: number) {
    const user = await this.usuariosRepository.findOne({
      where: { id_usuario: id, id_restaurante: id_restaurante }
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.usuariosRepository.remove(user);
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto, id_restaurante: number) {
    const user = await this.usuariosRepository.findOne({
      where: { id_usuario: id, id_restaurante: id_restaurante }
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    Object.assign(user, updateUsuarioDto);
    return this.usuariosRepository.save(user);
  }

  async googleLogin(googleLoginDto: any) {
    return { message: 'Google Login revertido para estabilidad local.' };
  }
}