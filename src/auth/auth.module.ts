//Este es el módulo que agrupará todos los componentes de autenticación.
//Importará TypeOrmModule.forFeature para tus entidades Usuario y Rol.
//Importará PassportModule y JwtModule.
//Declarará AuthService como proveedor y AuthController como controlador.
//Es crucial que exporte AuthService, JwtModule y PassportModule para que otros módulos (como ComandasModule) puedan usarlos para proteger rutas.

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Asegúrate de importar ambos
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';

@Module({
  imports: [
    // ¡IMPORTANTE! Agrega ConfigModule aquí si no es global o para mayor seguridad.
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([Usuario, Rol]),
    JwtModule.registerAsync({
      // Si usas registerAsync, **también** necesitas importar ConfigModule aquí dentro.
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' }, // O el tiempo de expiración que desees
      }),
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy, // Asegúrate de que JwtStrategy esté listado como proveedor
  ],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtModule], // Exporta lo que necesiten otros módulos
})
export class AuthModule {}