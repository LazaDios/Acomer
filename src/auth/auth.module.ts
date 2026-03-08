import { Module, OnModuleInit } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { RestaurantesModule } from '../restaurantes/restaurantes.module';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([Usuario, Rol]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
        global: true,
      }),
    }),
    RestaurantesModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule implements OnModuleInit {
  constructor(
    @InjectRepository(Rol)
    private readonly rolesRepository: Repository<Rol>,
  ) { }

  async onModuleInit() {
    try {
      const rolesCount = await this.rolesRepository.count();
      if (rolesCount === 0) {
        console.log('🌱 Sembrando roles iniciales...');
        await this.rolesRepository.save([
          { nombre: 'administrador' },
          { nombre: 'mesonero' },
          { nombre: 'cocinero' },
        ]);
        console.log('✅ Roles sembrados con éxito.');
      }
    } catch (error) {
      console.error('❌ Error al sembrar roles:', error.message);
    }
  }
}