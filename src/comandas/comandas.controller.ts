import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';

@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  create(@Body() createComandaDto: CreateComandaDto) {
    return this.comandasService.create(createComandaDto);
  }

  @Get()
  findAll() {
    return this.comandasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.comandasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateComandaDto: UpdateComandaDto) {
    return this.comandasService.update(+id, updateComandaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.comandasService.remove(id);
  }
}
