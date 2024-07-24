import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ExchangeService } from './application/exchange.service';
import { IReserveRepository } from './domain/reserve/reserve.repository.interface';
import { MikroOrmReserveRepository } from './infrastructure/persistence/mikro-orm/mikro-orm-reserve.repository';
import { Reserve } from './infrastructure/persistence/mikro-orm/reserve.entity';
import { ExchangeController } from './interfaces/http/exchange.controller';
import { ReserveGateway } from './interfaces/websocket/reserve.gateway';

@Module({
  imports: [MikroOrmModule.forRoot(), MikroOrmModule.forFeature([Reserve])],
  controllers: [ExchangeController],
  providers: [
    ExchangeService,
    ReserveGateway,
    {
      provide: IReserveRepository,
      useClass: MikroOrmReserveRepository,
    },
  ],
})
export class AppModule {}
