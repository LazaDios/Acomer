import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleComandaDto } from './create-detalle_comanda.dto';

export class UpdateDetalleComandaDto extends PartialType(CreateDetalleComandaDto) {}
