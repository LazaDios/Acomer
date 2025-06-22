import { IsNumber } from "class-validator";

export class CreateDetalleComandaDto {
    @IsNumber()
    cantidad: number;
    
    @IsNumber()
    subtotal_item: number; // Subtotal de este ítem (cantidad * precio_unitario del producto)

}
