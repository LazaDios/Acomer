import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

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
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.DB_PORT || '5436', 10),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: false, // ¡IMPORTANTE! Desactivar en producción
      ssl: process.env.POSTGRES_SSL === "true",
      extra: {
        ssl:
          process.env.POSTGRES_SSL === "true"
            ? {
                rejectUnauthorized: false,
              }
            : null,
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
