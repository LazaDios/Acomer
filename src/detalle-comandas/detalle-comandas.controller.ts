import { Controller,
   Get, 
   Post, 
   Body, 
   Patch, 
   Param, 
   Delete, 
   HttpCode, 
   HttpStatus, 
   ParseIntPipe, 
   Request, 
   UseGuards, 
   Logger 
  } from '@nestjs/common';
import { DetalleComandasService } from './detalle-comandas.service';
import { CreateDetalleComandaDto, CreateMultipleDetallesDto } from './dto/create-detalle-comanda.dto';
import { UpdateDetalleComandaDto } from './dto/update-detalle-comanda.dto';
import { DetalleComanda } from './entities/detalle-comanda.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { NombreRol } from 'src/auth/entities/rol.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('detalle-comandas')
export class DetalleComandasController {
  private readonly logger: Logger
  constructor(
    private readonly detalleComandasService: DetalleComandasService,
  ) {
    this.logger = new Logger(DetalleComandasController.name); // <-- Inicializa el logger aquí
  }



  @Patch(':comandaId/:detalleId') // Usamos PATCH para actualizaciones parciales
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard) // Aplica la guardia JWT y luego la guardia de Roles
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR)
  async updateSingleDetalle(
    @Param('comandaId', ParseIntPipe) comandaId: number,
    @Param('detalleId', ParseIntPipe) detalleId: number,
    @Body() updateDetalleItemDto: UpdateDetalleComandaDto,
    @Request() req, // Acceso al usuario autenticado para logging
  ) {
    this.logger.log(`Usuario ${req.user.username} (Rol: ${req.user.rol.nombre}) intentando actualizar detalle ${detalleId} de comanda ${comandaId}.`);
    return this.detalleComandasService.updateSingleDetalleComanda(
      comandaId,
      detalleId,
      updateDetalleItemDto,
    );
  }


  @Post('') // Un nuevo endpoint para añadir múltiples detalles
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard) // Aplica la guardia JWT y luego la guardia de Roles
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR)
  async create(@Body() createMultipleDetallesDto: CreateMultipleDetallesDto,
  @Request() req, // Acceso al usuario autenticado para logging
  ): Promise<DetalleComanda[]> {
    this.logger.log(`Usuario ${req.user.username} (Rol: ${req.user.rol.nombre}) intentando añadir múltiples detalles a comanda ${createMultipleDetallesDto.comandaId}.`);
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