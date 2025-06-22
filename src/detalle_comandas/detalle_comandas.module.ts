import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comanda } from 'src/comandas/entities/comanda.entity';
import { DetalleComanda } from './entities/detalle_comanda.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comanda, DetalleComanda, Producto])],
  controllers: [],
  providers: [],
})
export class DetalleComandasModule {}
