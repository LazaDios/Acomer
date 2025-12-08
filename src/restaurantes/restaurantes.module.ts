import { Module } from '@nestjs/common';
import { RestaurantesService } from './restaurantes.service';
import { RestaurantesController } from './restaurantes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurante } from './entities/restaurante.entity';
import { Usuario } from '../auth/entities/usuario.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurante, Usuario])],
    controllers: [RestaurantesController],
    providers: [RestaurantesService],
    exports: [RestaurantesService], // Exportamos por si otros módulos lo necesitan
})
export class RestaurantesModule { }
