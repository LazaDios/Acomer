import { Module } from '@nestjs/common';
import { DetalleComandasService } from './detalle-comandas.service';
import { DetalleComandasController } from './detalle-comandas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleComanda } from './entities/detalle-comanda.entity';
import { Comanda } from '../comandas/entities/comanda.entity';
import { Producto } from '../productos/entities/producto.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleComanda, Comanda, Producto]), EventsModule],
  controllers: [DetalleComandasController],
  providers: [DetalleComandasService],
  exports: [DetalleComandasService]
})
export class DetalleComandasModule { }
