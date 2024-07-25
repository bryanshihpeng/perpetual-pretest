import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ExchangeService } from './application/exchange.service';
import { IReserveRepository } from './domain/reserve/reserve.repository.interface';
import { InMemoryReserveRepository } from './infrastructure/persistence/memory/in-memory-reserve.repository';
import dbConfig from './infrastructure/persistence/mikro-orm/mikro-orm.config';
import { ExchangeController } from './interfaces/http/exchange.controller';
import { ReserveGateway } from './interfaces/websocket/reserve.gateway';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...dbConfig,
    }),
    EventEmitterModule.forRoot(),
  ],
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
