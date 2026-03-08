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
      restaurante_id: requestUser?.restaurante_id // Si viene un admin registrando, se hereda el restaurante
    });

    const savedUser = await this.usuariosRepository.save(user);
    const { password: _, ...result } = savedUser;
    return result;
  }

  async login(user: any, restauranteId?: number) {
    // Si se pasa un restauranteId, validamos que el usuario pertenezca a ese restaurante
    if (restauranteId && user.restaurante_id !== restauranteId) {
      throw new UnauthorizedException('No tienes permiso para acceder a este restaurante.');
    }

    const payload = {
      username: user.username,
      sub: user.id_usuario,
      rol: user.rol?.nombre || user.rol, // Maneja objeto o string
      restaurante_id: user.restaurante_id
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario: user.id_usuario,
        username: user.username,
        email: user.email,
        nombre_completo: user.nombre_completo,
        rol: user.rol?.nombre || user.rol,
        restaurante_id: user.restaurante_id,
      },
      restaurant: user.restaurante,
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
      this.logger.error('CRÍTICO: No se encontró el rol ADMINISTRADOR en la base de datos.');
      throw new NotFoundException('Rol ADMINISTRADOR no encontrado en la base de datos.');
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

      adminUser.restaurante_id = nuevoRestaurante.id_restaurante;
      await this.usuariosRepository.save(adminUser);

      this.logger.log(`Restaurante "${restaurantName}" registrado con éxito.`);

      return this.login(adminUser); // Usamos el método login común para devolver el token

    } catch (error) {
      this.logger.error(`Error en registro de restaurante: ${error.message}`);
      throw error;
    }
  }

  async findAllByRestaurant(restauranteId: number) {
    return this.usuariosRepository.find({
      where: { restaurante_id: restauranteId },
      relations: ['rol']
    });
  }

  async remove(id: number, restauranteId: number) {
    const user = await this.usuariosRepository.findOne({
      where: { id_usuario: id, restaurante_id: restauranteId }
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.usuariosRepository.remove(user);
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto, restauranteId: number) {
    const user = await this.usuariosRepository.findOne({
      where: { id_usuario: id, restaurante_id: restauranteId }
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    Object.assign(user, updateUsuarioDto);
    return this.usuariosRepository.save(user);
  }

  async googleLogin(googleLoginDto: any) {
    // Implementación mínima para evitar errores de compilación
    return { message: 'Google Login debe ser implementado con su lógica específica si se usa.' };
  }
}