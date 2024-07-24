import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ExchangeService } from './application/exchange.service';
import { IReserveRepository } from './domain/reserve/reserve.repository.interface';
import { PostgresReserveRepository } from './infrastructure/persistence/postgres-reserve.repository';
import { ExchangeController } from './interfaces/http/exchange.controller';
import { ReserveGateway } from './interfaces/websocket/reserve.gateway';
import { Reserve } from './infrastructure/persistence/entities/reserve.entity';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature([Reserve]),
  ],
  controllers: [ExchangeController],
  providers: [
    ExchangeService,
    ReserveGateway,
    {
      provide: IReserveRepository,
      useClass: PostgresReserveRepository,
    },
  ],
})
export class AppModule {}
