import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventNames } from '../../domain/events/event-names';
import { Reserve } from '../../domain/reserve/reserve.aggregate-root';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ReserveGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ReserveGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent(EventNames.RESERVE_CHANGE)
  handleReserveChangeEvent(reserves: Reserve[]) {
    this.logger.log(
      `Emitting reserveChange event: ${JSON.stringify(reserves)}`,
    );
    this.server.emit(EventNames.RESERVE_CHANGE, reserves);
  }
}
