import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class ReserveGateway {
  @WebSocketServer()
  server: Server;

  notifyReserveChange(reserves: { [key: string]: number }) {
    this.server.emit('reserveChange', reserves);
  }
}
