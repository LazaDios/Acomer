import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';

@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  create(@Body() createComandaDto: CreateComandaDto) {
    return this.comandasService.crearComandaConProductos(createComandaDto);
  }

  @Get()
  findAll() {
    return this.comandasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.comandasService.obtenerComandaConDetalles(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateComandaDto: UpdateComandaDto) {
    return this.comandasService.update(id, updateComandaDto);
  }

  @Patch(':id/detalle/:detalleId')
  updateDetalle(@Param('id') id: number, @Body() updateComandaDto: UpdateComandaDto) {
    return this.comandasService.actualizarDetalleComanda(id, updateComandaDto); 
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.comandasService.eliminarComanda(id);
  }
  
  @Delete(':id/detalle/:detalleId')
  removedetalle(@Param('detalleId') detalleId: number) {
    return this.comandasService.eliminarDetalleComanda(detalleId);
  }

}
