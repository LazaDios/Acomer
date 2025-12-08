import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantesService } from './restaurantes.service';
import { CreateRestauranteDto } from './dto/create-restaurante.dto';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Restaurantes')
@Controller('restaurantes')
export class RestaurantesController {
    constructor(private readonly restaurantesService: RestaurantesService) { }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createRestauranteDto: CreateRestauranteDto, @Request() req) {
        return this.restaurantesService.create(createRestauranteDto, req.user);
    }

    @Get()
    findAll() {
        return this.restaurantesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.restaurantesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRestauranteDto: UpdateRestauranteDto) {
        return this.restaurantesService.update(+id, updateRestauranteDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.restaurantesService.remove(+id);
    }
}
