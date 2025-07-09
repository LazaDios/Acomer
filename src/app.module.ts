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
    type: 'mysql',
    host: 'localhost',
    port: 3307,
    username: 'restaurante',
    password: 'root',
    database: 'restaurante',
    autoLoadEntities: true,
    // Sincronización y DROP SCHEMA para desarrollo:
    synchronize: true, // Sincroniza el esquema de la DB con las entidades
  }),
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
