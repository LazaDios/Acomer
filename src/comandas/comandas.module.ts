import { Module } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { ComandasController } from './comandas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comanda } from './entities/comanda.entity';
import { DetalleComanda } from 'src/detalle-comandas/entities/detalle-comanda.entity';
import { EventsModule } from 'src/events/events.module';
import { ProductosModule } from 'src/productos/productos.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Comanda]),
    EventsModule,
    ProductosModule,
  ],
  controllers: [ComandasController],
  providers: [ComandasService],
  exports: [ComandasService],
})
export class ComandasModule { }
