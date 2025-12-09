// src/events/comanda.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { EstadoComanda } from '../common/enums/comanda-estado.enum';

@WebSocketGateway({
  cors: {
    origin: '*', // ¡Cambia esto a tu dominio de frontend en producción!
    methods: ['GET', 'POST'],
  }
})
export class ComandaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server; // Objeto del servidor Socket.IO
  private readonly logger = new Logger(ComandaGateway.name);

  // Método para emitir eventos a clientes específicos o a todos
  // Lo haremos público para que pueda ser llamado desde el servicio
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.debug(`Evento '${event}' emitido con datos: ${JSON.stringify(data)}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Cliente WS conectado: ${client.id}`);
    // Opcional: client.emit('welcome', 'Conectado al servicio de comandas.');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente WS desconectado: ${client.id}`);
  }


  notifyComandaToKitchen(comanda_id: number, estado: EstadoComanda, mensaje: string = '') {
    this.logger.log(`DEBUG: Dentro de notifyComandaToKitchen para ID ${comanda_id}.`);
    if (!this.server) { // <-- ¡Añade esta verificación!
      this.logger.error('DEBUG ERROR: ¡this.server es undefined en notifyComandaToKitchen!');
      return; // Salir para evitar más errores
    }
    this.logger.log(`Intentando emitir evento 'comandaToKitchen' para ID ${comanda_id}`);
    this.server.emit('comandaToKitchen', {
      comanda_id,
      estado,
      mensaje: mensaje || `Comanda ${comanda_id} - Estado: ${estado}`,
    });
    this.logger.log(`Evento 'comandaToKitchen' emitido.`);
  }

  notifyComandaToWaiter(comanda_id: number, estado: EstadoComanda, mensaje: string = '') {
    this.logger.log(`Notificando a Camarero: Comanda ID ${comanda_id}, Estado ${estado}`);
    if (!this.server) {
      this.logger.error('DEBUG ERROR: ¡this.server es undefined en notifyComandaToWaiter!');
      return;
    }
    this.server.emit('comandaToWaiter', {
      comanda_id,
      estado,
      mensaje: mensaje || `Comanda ${comanda_id} - Estado: ${estado}`,
    });
  }

  /**
   * Emite un evento general para cualquier actualización de comanda.
   * Útil si otros roles (administrador) necesitan ver todos los cambios.
   * @param comanda_id ID de la comanda.
   * @param estado Estado actual de la comanda.
   * @param mensaje Mensaje descriptivo.
   */
  notifyComandaUpdate(comanda_id: number, estado: EstadoComanda, mensaje: string = '') {
    this.logger.log(`Notificación general de comanda: ID ${comanda_id}, Estado ${estado}`);
    this.server.emit('comandaUpdated', {
      comanda_id,
      estado,
      mensaje: mensaje || `Comanda ${comanda_id} actualizada a ${estado}`,
    });
  }
}