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
  UseGuards, // <-- Importa UseGuards para aplicar las guardias
  Request // <-- Importa Request para acceder al objeto de la petición (y req.user)
} from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { ComandaGateway } from 'src/events/comanda.gateway';
import { EstadoComanda } from 'src/common/enums/comanda-estado.enum';
import { Comanda } from './entities/comanda.entity'; // <-- Importa la entidad Comanda

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
  ApiBearerAuth, // Para indicar que el endpoint requiere JWT
} from '@nestjs/swagger';


@ApiTags('comandas') // Etiqueta el controlador para agruparlo en la UI de Swagger
@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}
  private readonly logger = new Logger(ComandasController.name); // Cambiado a ComandasController.name para mejor contexto del log

  @Post()
  @HttpCode(HttpStatus.CREATED) // Asegurarse de que devuelve 201 en la creación
  @UseGuards(JwtAuthGuard, RolesGuard) // Aplica la guardia JWT y luego la guardia de Roles
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR) // Solo Mesoneros y Administradores pueden crear comandas
  @ApiBearerAuth('access-token') // Indica que este endpoint requiere un token Bearer
  @ApiOperation({ summary: 'Crea una nueva comanda con sus detalles' }) // Descripción de la operación
  @ApiResponse({ status: 201, description: 'Comanda creada exitosamente.', type: Comanda }) // Posibles respuestas
  @ApiResponse({ status: 400, description: 'Datos de comanda inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  @ApiBody({ type: CreateComandaDto, description: 'Datos de la nueva comanda y sus detalles.' }) // Documenta el cuerpo de la petición
  create(@Body() createComandaDto: CreateComandaDto, @Request() req) {
    this.logger.log(`Usuario ${req.user.username} (Rol: ${req.user.rol.nombre}) está intentando crear una comanda.`);
    // Opcional: Podrías asignar el ID del mesonero que crea la comanda si es un campo en CreateComandaDto
    //createComandaDto.idMesonero = req.user.id_usuario;
    createComandaDto.nombre_mesonero = req.user.username; // Asigna el nombre de usuario del mesonero

    return this.comandasService.create(createComandaDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.ADMINISTRADOR, NombreRol.MESONERO, NombreRol.COCINERO) // Todos los roles pueden ver todas las comandas
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtiene todas las comandas con sus detalles de producto' })
  @ApiResponse({ status: 200, description: 'Lista de todas las comandas.', type: [Comanda] })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  findAll() {
    return this.comandasService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.ADMINISTRADOR, NombreRol.MESONERO, NombreRol.COCINERO) // Todos los roles pueden ver una comanda específica
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtiene una comanda específica por su ID con sus detalles de producto' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la comanda' }) // Documenta el parámetro de ruta
  @ApiResponse({ status: 200, description: 'Detalles de la comanda.', type: Comanda })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  findOne(@Param('id') id: number) {
    return this.comandasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(NombreRol.MESONERO, NombreRol.ADMINISTRADOR) // Solo Mesoneros y Administradores pueden modificar otros campos
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
  @Patch(':id/status') // Ruta: /comandas/{id}/status
  @HttpCode(HttpStatus.OK) // Código de estado 200 OK para actualizaciones exitosas
  @UseGuards(JwtAuthGuard, RolesGuard) // Aplica la guardia JWT y luego la guardia de Roles
  // La lógica de roles más granular se maneja dentro del método
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
        estado: EstadoComanda.PREPARANDO, // Ejemplo de cómo enviar el estado
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
    @Param('id') id: number, // Captura el ID de la URL
    @Body('estado') newStatus: EstadoComanda, // Captura solo la propiedad 'estado' del cuerpo de la petición
    @Request() req, // Necesario para acceder a req.user
  ) {
    // Lógica de autorización específica basada en el rol del usuario y el NUEVO estado
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

    return this.comandasService.updateComandaStatus(id, newStatus);
  }


  @Delete(':id') // Usa el decorador @Delete para manejar solicitudes DELETE
  @HttpCode(HttpStatus.NO_CONTENT) // Para devolver un 204 No Content si la operación es exitosa
  @UseGuards(JwtAuthGuard, RolesGuard) // Protege esta ruta
  @Roles(NombreRol.ADMINISTRADOR) // Solo Administradores pueden "eliminar" (softDelete) comandas
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Marca una comanda como CANCELADA (soft delete) - Solo Administradores' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la comanda a cancelar' })
  @ApiResponse({ status: 204, description: 'Comanda marcada como cancelada exitosamente.' })
  @ApiResponse({ status: 400, description: 'No se puede cancelar una comanda en su estado actual.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (rol incorrecto).' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada.' })
  async softDeleteComanda(@Param('id') id: number) { // @Param para extraer el ID de la URL
    try {
      this.logger.log(`Administrador intentando soft-delete comanda ${id}.`);
      await this.comandasService.softDelete(id);
    } catch (error) {
      this.logger.error(`Error al intentar cancelar comanda ${id}:`, error.stack); // Muestra el stack trace completo
      if (error instanceof NotFoundException) {
        throw error; // Relanza la excepción NotFoundException
      }
      if (error instanceof BadRequestException) { // <-- ¡NUEVO BLOQUE!
        throw error; // Relanza para que NestJS lo maneje como 400
      }
      // Manejar otros posibles errores aquí
      throw new Error('Error al cancelar la comanda.'); // O un HttpException más específico
    }
  }
}