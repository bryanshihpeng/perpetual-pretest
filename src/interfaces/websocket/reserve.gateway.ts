import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { EventEmitter2 } from 'eventemitter2';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ReserveGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ReserveGateway.name);

  constructor(private eventEmitter: EventEmitter2) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit() {
    this.eventEmitter.on(
      'reserveChange',
      (reserves: { [key: string]: number }) => {
        this.logger.log(
          `Emitting reserveChange event: ${JSON.stringify(reserves)}`,
        );
        this.server.emit('reserveChange', reserves);
      },
    );
  }
}
