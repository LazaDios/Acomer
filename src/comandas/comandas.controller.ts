import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { ComandaGateway } from 'src/events/comanda.gateway';
import { EstadoComanda } from 'src/common/enums/comanda-estado.enum';

@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}
  private readonly logger = new Logger(ComandaGateway.name);

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
    return this.comandasService.update(id, updateComandaDto);
  }

    // --- NUEVO MÉTODO PARA ACTUALIZAR EL ESTADO ---
  @Patch(':id/status') // Ruta: /comandas/{id}/status
  @HttpCode(HttpStatus.OK) // Opcional: Código de estado 200 OK para actualizaciones exitosas
  async updateStatus(
    @Param('id') id: number, // Captura el ID de la URL
    @Body('estado') newStatus: EstadoComanda, // Captura solo la propiedad 'estado' del cuerpo de la petición
  ) {
    // Aquí puedes añadir validaciones adicionales si newStatus no es un EstadoComanda válido
    // o si el cliente envía un estado inválido. NestJS DTO validation con Pipes es ideal aquí.

    return this.comandasService.updateComandaStatus(id, newStatus);
  }


  @Delete(':id') // Usa el decorador @Delete para manejar solicitudes DELETE
  @HttpCode(HttpStatus.NO_CONTENT) // Opcional: Para devolver un 204 No Content si la operación es exitosa
  async softDeleteComanda(@Param('id') id: number) { // @Param para extraer el ID de la URL
    try {
      await this.comandasService.softDelete(id);
      // No devolvemos nada si el HttpCode es 204. Si queremos devolver la comanda, quitamos el @HttpCode
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
