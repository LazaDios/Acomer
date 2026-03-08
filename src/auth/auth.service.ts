import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Rol, NombreRol } from './entities/rol.entity';
import { RestaurantesService } from '../restaurantes/restaurantes.service';

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

  async register(createUsuarioDto: CreateUsuarioDto) {
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
    });

    const savedUser = await this.usuariosRepository.save(user);
    const { password: _, ...result } = savedUser;
    return result;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id_usuario,
      rol: user.rol?.nombre,
      restaurante_id: user.restaurante_id
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario: user.id_usuario,
        username: user.username,
        email: user.email,
        nombre_completo: user.nombre_completo,
        rol: user.rol?.nombre,
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

    // 1. Verificar si ya existe el usuario o email
    const existingUser = await this.usuariosRepository.findOne({
      where: [{ username }, { email }]
    });

    if (existingUser) {
      throw new BadRequestException('El nombre de usuario o email ya está registrado.');
    }

    // 2. Buscar el rol ADMINISTRADOR
    const rolAdmin = await this.rolesRepository.findOne({ where: { nombre: NombreRol.ADMINISTRADOR } });
    if (!rolAdmin) {
      this.logger.error('CRÍTICO: No se encontró el rol ADMINISTRADOR en la base de datos.');
      throw new NotFoundException('Rol ADMINISTRADOR no encontrado en la base de datos.');
    }

    // 3. Crear el Usuario (SIN restaurante todavía para no tener FK circular en el primer paso si falla)
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
      // 4. Crear el Restaurante
      const nuevoRestaurante = await this.restaurantesService.create({
        nombre: restaurantName,
        direccion: 'Dirección pendiente',
        telefono: '',
      });

      // 5. Vincular Usuario y Restaurante
      adminUser.restaurante_id = nuevoRestaurante.id_restaurante;
      await this.usuariosRepository.save(adminUser);

      this.logger.log(`Restaurante "${restaurantName}" registrado con éxito.`);

      // 6. Login Automático
      const payload = {
        username: adminUser.username,
        sub: adminUser.id_usuario,
        rol: rolAdmin.nombre,
        restaurante_id: nuevoRestaurante.id_restaurante
      };

      return {
        access_token: this.jwtService.sign(payload),
        restaurant: nuevoRestaurante,
        usuario: {
          id_usuario: adminUser.id_usuario,
          username: adminUser.username,
          rol: rolAdmin.nombre,
          restaurante_id: nuevoRestaurante.id_restaurante
        }
      };

    } catch (error) {
      this.logger.error(`Error en registro de restaurante: ${error.message}`);
      // Si falla la creación del restaurante, podríamos borrar al usuario, 
      // pero por ahora lo dejamos para depurar.
      throw error;
    }
  }

  async googleLogin(idToken: string) {
    // Implementación de googleLogin si es necesaria, similar a la anterior pero consistente
    // ...
    return { message: 'Google Login pendiente de ajustar si se requiere' };
  }
}