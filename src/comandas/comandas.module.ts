import { Module } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { ComandasController } from './comandas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comanda } from './entities/comanda.entity';
import { DetalleComanda } from 'src/detalle_comandas/entities/detalle_comanda.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comanda,
      DetalleComanda, 
      Producto])],
  controllers: [ComandasController],
  providers: [ComandasService],
  exports: [ComandasService], // Exporta el servicio si lo necesitas en otros módulos
})
export class ComandasModule {}
