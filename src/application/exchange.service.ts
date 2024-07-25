import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Currency } from '../domain/core/currency/currency';
import { Money } from '../domain/core/currency/money';
import {
  IsolationLevel,
  ITransactionManager,
} from '../domain/core/transaction/transaction.interface';
import { EventNames } from '../domain/events/event-names';
import { ExchangeRateCalculator } from '../domain/exchange/exchange-rate-calculator';
import { IReserveRepository } from '../domain/reserve/reserve.repository.interface';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private readonly MAX_RETRIES = 3;

  constructor(
    @Inject(IReserveRepository)
    private readonly reserveRepository: IReserveRepository,
    @Inject(ITransactionManager)
    private readonly transactionManager: ITransactionManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async exchange(
    fromCurrency: Currency,
    toCurrency: Currency,
    fromCurrencyAmount: number,
  ): Promise<number> {
    let retries = 0;
    while (retries < this.MAX_RETRIES) {
      try {
        return await this.transactionManager.runInTransaction(async () => {
          if (fromCurrencyAmount <= 0) {
            throw new Error('Trade amount must be positive');
          }

          const money = new Money(fromCurrency, fromCurrencyAmount);

          const fromReserve =
            await this.reserveRepository.getReserve(fromCurrency);
          const toReserve = await this.reserveRepository.getReserve(toCurrency);

          const toReserveSubtraction =
            ExchangeRateCalculator.calculateExchangeAmount(
              fromReserve,
              toReserve,
              fromCurrencyAmount,
            );

          if (toReserve.amount <= toReserveSubtraction.amount) {
            throw new Error('Insufficient reserve for the trade');
          }

          fromReserve.add(money);
          toReserve.subtract(toReserveSubtraction);

          await this.reserveRepository.updateReserve(fromReserve);
          await this.reserveRepository.updateReserve(toReserve);

          this.logger.log(
            `Trade executed: ${fromCurrencyAmount} ${fromCurrency.code} to ${toReserveSubtraction.amount} ${toCurrency.code}`,
          );

          // Emit event about the reserve change
          this.eventEmitter.emit(EventNames.RESERVE_CHANGE, [
            fromReserve,
            toReserve,
          ]);

          return toReserveSubtraction.amount;
          // Using Serializable isolation level for the following reasons:
          // 1. Currency exchange operations involve simultaneous changes to multiple reserves, requiring strong data consistency.
          // 2. In high-concurrency scenarios, lower isolation levels may lead to frequent transaction conflicts and retries, potentially reducing overall efficiency.
          // 3. Serializable isolation ensures transactions are executed in order, avoiding complex conflict resolution logic.
          // 4. While it may slightly impact performance, data accuracy is more critical than performance in financial transactions.
          // 5. In situations where conflicts are expected to be common, using the highest isolation level can reduce the number of retries, potentially improving overall throughput.
        }, IsolationLevel.SERIALIZABLE);
      } catch (error) {
        if (
          error.name === 'UniqueConstraintViolationException' ||
          error.name === 'LockWaitTimeoutException'
        ) {
          retries++;
          this.logger.warn(`Retrying transaction (attempt ${retries})`);
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries reached. Unable to complete the transaction.');
  }
}
