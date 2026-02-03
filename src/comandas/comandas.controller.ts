import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Logger,
  UseGuards,
  Request
} from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { ComandaGateway } from 'src/events/comanda.gateway';
import { EstadoComanda } from 'src/common/enums/comanda-estado.enum';
import { Comanda } from './entities/comanda.entity';

// --- Importaciones de los módulos de autenticación/autorización ---
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { NombreRol } from 'src/auth/entities/rol.entity';

// --- Importaciones de Swagger ---
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';


@ApiTags('comandas')
@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) { }
  private readonly logger = new Logger(ComandasController.name);

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crea una nueva comanda' })
  @ApiBody({ type: CreateComandaDto })
  @ApiResponse({ status: 201, description: 'Comanda creada exitosamente.', type: Comanda })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  create(@Body() createComandaDto: CreateComandaDto, @Request() req) {
    const restauranteId = req.user.id_restaurante;

    // DEBUG: Ver qué usuario está creando la comanda
    this.logger.log(`Creando comanda. Datos del usuario en token: ${JSON.stringify(req.user)}`);

    // Asignamos el nombre del mesonero automáticamente desde el token (req.user)
    // Prioridad: nombre_completo > username
    const nombre = (req.user.nombre_completo && req.user.nombre_completo !== 'N/A')
      ? req.user.nombre_completo
      : req.user.username;

    createComandaDto.nombre_mesonero = nombre;

    this.logger.log(`Nombre de mesonero asignado a la comanda: ${createComandaDto.nombre_mesonero}`);

    return this.comandasService.create(createComandaDto, restauranteId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR, NombreRol.COCINERO)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtiene todas las comandas del restaurante' })
  @ApiResponse({ status: 200, description: 'Lista de comandas del restaurante.', type: [Comanda] })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  findAll(@Request() req) {
    const restauranteId = req.user.id_restaurante;
    return this.comandasService.findAll(restauranteId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR, NombreRol.COCINERO)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtiene una comanda específica por su ID con sus detalles de producto' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la comanda' })
  @ApiResponse({ status: 200, description: 'Detalles de la comanda.', type: Comanda })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  findOne(@Param('id') id: number) {
    return this.comandasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualiza campos de una comanda (excepto el estado)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la comanda a actualizar' })
  @ApiBody({ type: UpdateComandaDto, description: 'Campos a actualizar de la comanda.' })
  @ApiResponse({ status: 200, description: 'Comanda actualizada exitosamente.', type: Comanda })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada.' })
  update(@Param('id') id: number, @Body() updateComandaDto: UpdateComandaDto) {
    return this.comandasService.update(id, updateComandaDto);
  }

  // --- MÉTODO PARA ACTUALIZAR EL ESTADO ---
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualiza el estado de una comanda basado en el rol del usuario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la comanda a actualizar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: { type: 'string', enum: Object.values(EstadoComanda), description: 'Nuevo estado de la comanda' },
      },
      example: {
        estado: EstadoComanda.PREPARANDO,
      },
    },
    description: 'Nuevo estado para la comanda (ABIERTA, PREPARANDO, FINALIZADA, CERRADA, CANCELADA).'
  })
  @ApiResponse({ status: 200, description: 'Estado de la comanda actualizado exitosamente.', type: Comanda })
  @ApiResponse({ status: 400, description: 'Transición de estado no permitida o rol no autorizado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada.' })
  async updateStatus(
    @Param('id') id: number,
    @Body('estado') newStatus: EstadoComanda,
    @Body('referencia_pago') referenciaPago: string, // Capturamos la referencia opcional
    @Request() req,
  ) {
    const userRol = req.user.rol.nombre;
    this.logger.log(`Usuario ${req.user.username} (Rol: ${req.user.rol.nombre}) está intentando modificar el status de la comanda ${id} a ${newStatus}.`);

    switch (newStatus) {
      case EstadoComanda.PREPARANDO:
        if (userRol !== NombreRol.COCINERO && userRol !== NombreRol.ADMINISTRADOR) {
          throw new BadRequestException('Solo un cocinero o administrador puede poner una comanda en preparación.');
        }
        break;
      case EstadoComanda.FINALIZADA:
        if (userRol !== NombreRol.COCINERO && userRol !== NombreRol.ADMINISTRADOR) {
          throw new BadRequestException('Solo un cocinero o administrador puede finalizar una comanda.');
        }
        break;
      case EstadoComanda.CERRADA:
        if (userRol !== NombreRol.MESONERO && userRol !== NombreRol.ADMINISTRADOR) {
          throw new BadRequestException('Solo un mesonero o administrador puede cerrar una comanda.');
        }
        break;
      case EstadoComanda.CANCELADA:
        if (userRol !== NombreRol.MESONERO && userRol !== NombreRol.ADMINISTRADOR) {
          throw new BadRequestException('Solo un mesonero o administrador puede cancelar una comanda.');
        }
        break;
      case EstadoComanda.ABIERTA:
        if (userRol !== NombreRol.ADMINISTRADOR) {
          throw new BadRequestException('Solo un administrador puede reabrir una comanda.');
        }
        break;
      default:
        throw new BadRequestException('Transición de estado no permitida o rol no autorizado.');
    }

    return this.comandasService.updateComandaStatus(id, newStatus, referenciaPago);
  }


  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.ADMINISTRADOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Marca una comanda como CANCELADA (soft delete) - Solo Administradores' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la comanda a cancelar' })
  @ApiResponse({ status: 204, description: 'Comanda marcada como cancelada exitosamente.' })
  @ApiResponse({ status: 400, description: 'No se puede cancelar una comanda en su estado actual.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada.' })
  async softDeleteComanda(@Param('id') id: number) {
    try {
      this.logger.log(`Administrador intentando soft-delete comanda ${id}.`);
      await this.comandasService.softDelete(id);
    } catch (error) {
      this.logger.error(`Error al intentar cancelar comanda ${id}:`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Error al cancelar la comanda.');
    }
  }
}