import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Request, ForbiddenException } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { NombreRol } from 'src/auth/entities/rol.entity';
import { Producto } from './entities/producto.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('productos') // Etiqueta el controlador para agruparlo en la UI de Swagger
@UseGuards(JwtAuthGuard, RolesGuard)
//@Roles(NombreRol.ADMINISTRADOR) //SOLO LOS ADMID PUEDEN VER LOS PRODUCTOS
@Controller('productos')

export class ProductosController {
  constructor(private readonly productosService: ProductosService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crea un nuevo producto (solo administradores)' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.', type: Producto })
  @ApiResponse({ status: 400, description: 'Datos de producto inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (solo administradores pueden crear productos).' })
  @ApiBody({ type: CreateProductoDto, description: 'Datos para crear un nuevo producto.' })
  create(@Body() createProductoDto: CreateProductoDto, @Request() req) {
    const restauranteId = req.user.id_restaurante;
    if (!restauranteId) {
      // Opcional: lanzar excepción si no tiene restaurante (ej: es un superadmin global sin restaurante asignado)
      // O permitirlo si la lógica de negocio lo requiere. 
      // Dado el requerimiento del usuario, lo haremos obligatorio para este endpoint.
      throw new ForbiddenException('No tienes un restaurante asignado para realizar esta acción.');
    }
    return this.productosService.create(createProductoDto, restauranteId);
  }

  @Get()
  @ApiBearerAuth('access-token') // Descomentado para exigir token
  @ApiOperation({ summary: 'Obtiene todos los productos del restaurante del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de todos los productos.', type: [Producto] })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  findAll(@Request() req) {
    const restauranteId = req.user.id_restaurante;
    return this.productosService.findAll(restauranteId);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtiene un producto específico por su ID (solo administradores)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto' }) // Documenta el parámetro de ruta
  @ApiResponse({ status: 200, description: 'Detalles del producto.', type: Producto })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (solo administradores pueden ver productos).' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  findOne(@Param('id') id: number) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualiza un producto existente por su ID (solo administradores)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto a actualizar' })
  @ApiBody({ type: UpdateProductoDto, description: 'Campos a actualizar del producto.' })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.', type: Producto })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (solo administradores pueden actualizar productos).' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  update(@Param('id') id_producto: number, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(id_producto, updateProductoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Elimina un producto por su ID (solo administradores)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto a eliminar' })
  @ApiResponse({ status: 204, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (solo administradores pueden eliminar productos).' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }
}
