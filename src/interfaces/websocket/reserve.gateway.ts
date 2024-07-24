import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ReserveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ReserveGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notifyReserveChange(reserves: { [key: string]: number }) {
    this.logger.log(`Emitting reserveChange event: ${JSON.stringify(reserves)}`);
    this.server.emit('reserveChange', reserves);
  }
}
