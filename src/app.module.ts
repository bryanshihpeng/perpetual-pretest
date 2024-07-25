import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ExchangeService } from './application/exchange.service';
import { ITransactionManager } from './domain/core/transaction/transaction.interface';
import { IReserveRepository } from './domain/reserve/reserve.repository.interface';
import { InMemoryReserveRepository } from './infrastructure/persistence/memory/in-memory-reserve.repository';
import { InMemoryTransactionManager } from './infrastructure/persistence/memory/in-memory-transaction-manager';
import { MikroOrmTransactionManager } from './infrastructure/persistence/mikro-orm/mikro-orm-transaction-manager';
import dbConfig from './infrastructure/persistence/mikro-orm/mikro-orm.config';
import { ExchangeController } from './interfaces/http/exchange.controller';
import { ReserveGateway } from './interfaces/websocket/reserve.gateway';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...dbConfig,
    }),
    EventEmitterModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(
        __dirname,
        '..',
        'src',
        'interfaces',
        'http',
        'client',
        'build',
      ),
      exclude: ['/api*'],
    }),
  ],
  controllers: [ExchangeController],
  providers: [
    ExchangeService,
    ReserveGateway,
    {
      provide: IReserveRepository,
      useClass: InMemoryReserveRepository,
    },
    {
      provide: ITransactionManager,
      useClass:
        process.env.NODE_ENV === 'test'
          ? InMemoryTransactionManager
          : MikroOrmTransactionManager,
    },
  ],
})
export class AppModule {}
