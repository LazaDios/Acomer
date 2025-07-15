import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { NombreRol } from 'src/auth/entities/rol.entity';
import { Producto } from './entities/producto.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('productos') // Etiqueta el controlador para agruparlo en la UI de Swagger
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(NombreRol.ADMINISTRADOR) //SOLO LOS ADMID PUEDEN VER LOS PRODUCTOS
@Controller('productos')

export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token') // Indica que este endpoint requiere un token Bearer
  @ApiOperation({ summary: 'Crea un nuevo producto (solo administradores)' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.', type: Producto })
  @ApiResponse({ status: 400, description: 'Datos de producto inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (solo administradores pueden crear productos).' })
  @ApiBody({ type: CreateProductoDto, description: 'Datos para crear un nuevo producto.' })
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtiene todos los productos (solo administradores)' })
  @ApiResponse({ status: 200, description: 'Lista de todos los productos.', type: [Producto] })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado (solo administradores pueden ver productos).' })
  findAll() {
    return this.productosService.findAll();
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
