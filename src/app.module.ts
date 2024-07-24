import { Module } from '@nestjs/common';
import { ExchangeService } from './application/exchange.service';
import { IReserveRepository } from './domain/reserve/reserve.repository.interface';
import { InMemoryReserveRepository } from './infrastructure/persistence/in-memory-reserve.repository';
import { ExchangeController } from './interfaces/http/exchange.controller';

@Module({
  imports: [],
  controllers: [ExchangeController],
  providers: [
    ExchangeService,
    {
      provide: IReserveRepository,
      useClass: InMemoryReserveRepository,
    },
  ],
})
export class AppModule {}
