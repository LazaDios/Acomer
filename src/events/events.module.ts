// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { ComandaGateway } from './comanda.gateway'; // Importa el Gateway

@Module({
  providers: [ComandaGateway], // El Gateway es un proveedor en este módulo
  exports: [ComandaGateway],   // ¡Exporta el Gateway para que otros módulos puedan usarlo!
})
export class EventsModule {}