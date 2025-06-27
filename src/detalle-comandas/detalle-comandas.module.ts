import { Module } from '@nestjs/common';
import { DetalleComandasService } from './detalle-comandas.service';
import { DetalleComandasController } from './detalle-comandas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleComanda } from './entities/detalle-comanda.entity';
import { Comanda } from 'src/comandas/entities/comanda.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleComanda, Comanda, Producto])],
  controllers: [DetalleComandasController],
  providers: [DetalleComandasService],
  exports: [DetalleComandasService]
})
export class DetalleComandasModule {}
