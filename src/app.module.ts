import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComandasModule } from './comandas/comandas.module';
import { ProductosModule } from './productos/productos.module';
import { DetalleComandasModule } from './detalle_comandas/detalle_comandas.module';

@Module({
  imports: [
    ComandasModule,
    ProductosModule,
    DetalleComandasModule,
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3307,
    username: 'restaurante',
    password: 'root',
    database: 'restaurante',
    autoLoadEntities: true,
    synchronize: true,}),
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
