import { Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventNames } from '../../domain/reserve/events/event-names';
import { Reserve } from '../../domain/reserve/reserve.aggregate-root';
import { IReserveRepository } from '../../domain/reserve/reserve.repository.interface';

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

  constructor(
    @Inject(IReserveRepository)
    private readonly reserveRepository: IReserveRepository,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const reserves = await this.reserveRepository.getAllReserves();
    client.emit('reservesUpdated', reserves);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToReserves')
  handleSubscribeToReserves(client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to reserves updates`);
    client.join('reservesRoom');
  }

  @SubscribeMessage('unsubscribeFromReserves')
  handleUnsubscribeFromReserves(client: Socket) {
    this.logger.log(`Client ${client.id} unsubscribed from reserves updates`);
    client.leave('reservesRoom');
  }

  @SubscribeMessage('requestReserves')
  async handleRequestReserves(client: Socket) {
    this.logger.log(`Client ${client.id} requested reserves update`);
    const reservesObject = await this.reserveRepository.getAllReserves();
    client.emit('reservesUpdated', reservesObject);
  }

  @OnEvent(EventNames.RESERVE_CHANGE)
  async handleReserveChangeEvent(reserves: Reserve[]) {
    const reservesObject = await this.reserveRepository.getAllReserves();
    this.logger.log(
      `Emitting reservesUpdated event: ${JSON.stringify(reservesObject)}`,
    );
    this.server.to('reservesRoom').emit('reservesUpdated', reservesObject);
  }
}
