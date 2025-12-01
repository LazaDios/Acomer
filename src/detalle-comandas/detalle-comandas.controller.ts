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
import { /*CreateDetalleComandaDto,*/ CreateMultipleDetallesDto } from './dto/create-detalle-comanda.dto';
import { UpdateDetalleComandaDto } from './dto/update-detalle-comanda.dto';
import { DetalleComanda } from './entities/detalle-comanda.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { NombreRol } from '../auth/entities/rol.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Comanda } from '../comandas/entities/comanda.entity';

// --- Importaciones de Swagger ---
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('detalle-comandas')
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
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR) // Solo Mesoneros y Administradores pueden actualizar detalles
  @ApiBearerAuth('access-token') // Indica que este endpoint requiere un token Bearer
  @ApiOperation({ summary: 'Actualiza un ítem de detalle de una comanda específica (solo Mesoneros/Admin)' })
  @ApiParam({ name: 'comandaId', type: Number, description: 'ID de la comanda a la que pertenece el detalle' })
  @ApiParam({ name: 'detalleId', type: Number, description: 'ID del detalle de comanda a actualizar' })
  @ApiBody({ type: UpdateDetalleComandaDto, description: 'Campos a actualizar del detalle (ej. cantidad, notas).' })
  @ApiResponse({ status: 200, description: 'Detalle de comanda actualizado exitosamente.', type: DetalleComanda })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  @ApiResponse({ status: 404, description: 'Comanda o detalle de comanda no encontrado.' })
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


  @Post('') // Endpoint para añadir múltiples detalles a una comanda existente
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard) // Aplica la guardia JWT y luego la guardia de Roles
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR) // Solo Mesoneros y Administradores pueden añadir nuevos detalles
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Añade uno o varios ítems de detalle a una comanda existente (solo Mesoneros/Admin)' })
  @ApiBody({ type: CreateMultipleDetallesDto, description: 'Datos de los nuevos detalles a añadir a una comanda.' })
  @ApiResponse({ status: 201, description: 'Detalles de comanda añadidos exitosamente.', type: [DetalleComanda] })
  @ApiResponse({ status: 400, description: 'Datos inválidos o comanda no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  async create(@Body() createMultipleDetallesDto: CreateMultipleDetallesDto,
  @Request() req, // Acceso al usuario autenticado para logging
  ): Promise<DetalleComanda[]> {
    this.logger.log(`Usuario ${req.user.username} (Rol: ${req.user.rol.nombre}) intentando añadir múltiples detalles a comanda ${createMultipleDetallesDto.comandaId}.`);
    return this.detalleComandasService.create(createMultipleDetallesDto);
  }

  /*@Post()
 create(@Body() createDetalleComandaDto: CreateDetalleComandaDto) {
    return this.detalleComandasService.create(createDetalleComandaDto);
  } esta solo agrega un producto a la comanda*/

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.ADMINISTRADOR, NombreRol.MESONERO, NombreRol.COCINERO) // Todos los roles pueden ver todos los detalles
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtiene todos los detalles de comanda' })
  @ApiResponse({ status: 200, description: 'Lista de todos los detalles de comanda.', type: [DetalleComanda] })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  findAll() {
    return this.detalleComandasService.findAll();
  }
  

@Get(':id')
@HttpCode(HttpStatus.OK)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(NombreRol.MESONERO, NombreRol.COCINERO, NombreRol.ADMINISTRADOR) // Permite a todos los operativos ver una comanda
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Obtiene una comanda por ID con todos sus detalles (útil para edición)' })
@ApiParam({ name: 'id', type: Number, description: 'ID de la comanda' })
@ApiResponse({ status: 200, description: 'Comanda encontrada.', type: Comanda })
@ApiResponse({ status: 404, description: 'Comanda no encontrada.' })
@ApiResponse({ status: 403, description: 'No autorizado.' })
async findOneWithDetails(
    @Param('id', ParseIntPipe) id: number
): Promise<Comanda> {
    // LLama al servicio para obtener la comanda con detalles y productos anidados
    return this.detalleComandasService.findOneWithDetails(id);
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

  
  // --- ENDPOINT PARA EL DASHBOARD DEL COCINERO ---
  // NOTA: Este endpoint debería estar en ComandasController, no en DetalleComandasController.
  // Tu ComandasController ya tiene un método findComandasForCocineroDashboard.
  // Si lo necesitas aquí, deberías inyectar ComandasService y llamarlo desde aquí.
  // Sin embargo, por convención, las listas de comandas (incluso filtradas) van en ComandasController.

  @Get('cocinero/pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.COCINERO, NombreRol.ADMINISTRADOR, NombreRol.MESONERO) // Cocineros, Administradores y Mesoneros pueden acceder
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtiene comandas en estado ABIERTA, PREPARANDO o CANCELADA para el dashboard del cocinero' })
  @ApiResponse({ status: 200, description: 'Lista de comandas relevantes para cocina.', type: [Comanda] })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  async getComandasForCocinero(): Promise<Comanda[]> {
    this.logger.log(`Usuario (Cocinero/Admin) solicitando comandas pendientes para cocina.`);
    // Si este método está aquí, necesitarías inyectar ComandasService en este controlador
    // y llamar a comandasService.findComandasForCocineroDashboard();
    return this.detalleComandasService.findComandasForCocineroDashboard(); // Esto asume que el servicio de detalles tiene el método, lo cual es incorrecto.
  }

  // --- AGREGAR ESTE MÉTODO NUEVO ---
  @Get('mesonero/pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR) // Solo Mesoneros y Admin
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtiene comandas activas (Abierta, Preparando, Finalizada) para el dashboard del mesonero' })
  @ApiResponse({ status: 200, description: 'Lista de comandas activas.', type: [Comanda] })
  async getComandasForMesonero(): Promise<Comanda[]> {
    this.logger.log(`Usuario (Mesonero) solicitando comandas activas.`);
    // Llamamos a un nuevo servicio específico para el Mesonero
    return this.detalleComandasService.findComandasForMesoneroDashboard(); 
  }


}