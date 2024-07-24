import { Module } from '@nestjs/common';
import { ExchangeService } from './application/exchange.service';
import { IReserveRepository } from './domain/reserve/reserve.repository.interface';
import { InMemoryReserveRepository } from './infrastructure/persistence/in-memory-reserve.repository';
import { ExchangeController } from './interfaces/http/exchange.controller';
import { ReserveGateway } from './interfaces/websocket/reserve.gateway';

@Module({
  imports: [],
  controllers: [ExchangeController],
  providers: [
    ExchangeService,
    ReserveGateway,
    {
      provide: IReserveRepository,
      useClass: InMemoryReserveRepository,
    },
  ],
})
export class AppModule {}
