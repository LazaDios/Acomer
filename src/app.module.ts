import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Tus módulos existentes
import { ComandasModule } from './comandas/comandas.module';
import { DetalleComandasModule } from './detalle-comandas/detalle-comandas.module';
import { ProductosModule } from './productos/productos.module';
import { EventsModule } from './events/events.module';

// Tu nuevo módulo de autenticación
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      // ¡ESTO ES CLAVE! Asegúrate de que `isGlobal: true` esté aquí.
      isGlobal: true,
      validationSchema: Joi.object({
      JWT_SECRET: Joi.string().required(),
        // ... otras variables de entorno que necesites validar
      }),
      envFilePath: '.env', // Asegúrate de que apunte a tu archivo .env
    }),
    ProductosModule,
    ComandasModule,
    DetalleComandasModule,
    EventsModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false, // ¡Siempre false en producción!
          ssl: isProduction ? { rejectUnauthorized: false } : false, // <-- CAMBIO CLAVE AQUÍ
          // logging: true, // Útil para depurar conexiones
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
