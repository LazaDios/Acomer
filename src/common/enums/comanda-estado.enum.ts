export enum EstadoComanda {
  ABIERTA = 'Abierta',       // Camarero: Comanda creada, enviada a cocina
  PREPARANDO = 'Preparando', // Cocinero: Comanda en proceso de preparación
  FINALIZADA = 'Finalizada', // Cocinero: Platillos listos, esperando ser entregados
  CERRADA = 'Cerrada',       // Camarero: Comanda entregada al cliente
  CANCELADA = 'Cancelada',   // Cliente/Camarero: Pedido anulado
}