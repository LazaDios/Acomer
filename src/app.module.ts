import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosModule } from './productos/productos.module';
import { ComandasModule } from './comandas/comandas.module';
import { DetalleComandasModule } from './detalle-comandas/detalle-comandas.module';


@Module({
  imports: [
    ProductosModule,
    ComandasModule,
    DetalleComandasModule,
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
