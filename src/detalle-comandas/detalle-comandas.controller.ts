import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { DetalleComandasService } from './detalle-comandas.service';
import { CreateDetalleComandaDto, CreateMultipleDetallesDto } from './dto/create-detalle-comanda.dto';
import { UpdateDetalleComandaDto } from './dto/update-detalle-comanda.dto';
import { DetalleComanda } from './entities/detalle-comanda.entity';

@Controller('detalle-comandas')
export class DetalleComandasController {
  constructor(private readonly detalleComandasService: DetalleComandasService) {}


  @Patch(':comandaId/:detalleId') // Usamos PATCH para actualizaciones parciales
  @HttpCode(HttpStatus.OK)
  async updateSingleDetalle(
    @Param('comandaId', ParseIntPipe) comandaId: number,
    @Param('detalleId', ParseIntPipe) detalleId: number,
    @Body() updateDetalleItemDto: UpdateDetalleComandaDto,
  ) {
    return this.detalleComandasService.updateSingleDetalleComanda(
      comandaId,
      detalleId,
      updateDetalleItemDto,
    );
  }








  @Post('') // Un nuevo endpoint para añadir múltiples detalles
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMultipleDetallesDto: CreateMultipleDetallesDto): Promise<DetalleComanda[]> {
    return this.detalleComandasService.create(createMultipleDetallesDto);
  }
  /*@Post()
 create(@Body() createDetalleComandaDto: CreateDetalleComandaDto) {
    return this.detalleComandasService.create(createDetalleComandaDto);
  }*/

  @Get()
  findAll() {
    return this.detalleComandasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    //return this.detalleComandasService.find(id);
    return 0;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleComandaDto: UpdateDetalleComandaDto) {
   // return this.detalleComandasService.update(+id, updateDetalleComandaDto);
   return 0;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleComandasService.remove(+id);
  }
}
