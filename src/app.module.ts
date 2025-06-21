import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComandasModule } from './comandas/comandas.module';

@Module({
  imports: [
    ComandasModule,
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
