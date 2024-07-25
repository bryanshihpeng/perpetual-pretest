import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Currency } from '../domain/core/currency/currency';
import { Money } from '../domain/core/currency/money';
import { IsolationLevel } from '../domain/core/transaction/isolation-level.enum';
import { ITransactionManager } from '../domain/core/transaction/transaction-manager.interface';
import { ExchangeRateCalculator } from '../domain/exchange/exchange-rate-calculator';

import { EventNames } from '../domain/reserve/events/event-names';
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
    return this.executeWithRetry(async () => {
      return this.transactionManager.runInTransaction(async () => {
        await this.validateExchange(fromCurrency, toCurrency, fromCurrencyAmount);
        const { fromReserve, toReserve, toReserveSubtraction } = await this.calculateExchange(fromCurrency, toCurrency, fromCurrencyAmount);
        await this.updateReserves(fromReserve, toReserve, toReserveSubtraction);
        this.logExchange(fromCurrency, toCurrency, fromCurrencyAmount, toReserveSubtraction.amount);
        this.emitReserveChangeEvent(fromReserve, toReserve);
        return toReserveSubtraction.amount;
      }, IsolationLevel.SERIALIZABLE);
    });
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let retries = 0;
    while (retries < this.MAX_RETRIES) {
      try {
        return await operation();
      } catch (error) {
        if (this.isRetryableError(error)) {
          retries++;
          this.logger.warn(`Retrying transaction (attempt ${retries})`);
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries reached. Unable to complete the transaction.');
  }

  private isRetryableError(error: any): boolean {
    return error.name === 'UniqueConstraintViolationException' || error.name === 'LockWaitTimeoutException';
  }

  private async validateExchange(fromCurrency: Currency, toCurrency: Currency, fromCurrencyAmount: number): Promise<void> {
    if (fromCurrencyAmount <= 0) {
      throw new Error('Trade amount must be positive');
    }
  }

  private async calculateExchange(fromCurrency: Currency, toCurrency: Currency, fromCurrencyAmount: number) {
    const money = new Money(fromCurrency, fromCurrencyAmount);
    const fromReserve = await this.reserveRepository.getReserve(fromCurrency);
    const toReserve = await this.reserveRepository.getReserve(toCurrency);

    if (fromReserve.amount <= money.amount) {
      throw new Error('Insufficient reserve for the trade');
    }

    const toReserveSubtraction = ExchangeRateCalculator.calculateExchangeAmount(
      fromReserve,
      toReserve,
      fromCurrencyAmount,
    );

    if (toReserve.amount <= toReserveSubtraction.amount) {
      throw new Error('Insufficient reserve for the trade');
    }

    return { fromReserve, toReserve, toReserveSubtraction };
  }

  private async updateReserves(fromReserve: Reserve, toReserve: Reserve, toReserveSubtraction: Money): Promise<void> {
    fromReserve.add(new Money(fromReserve.currency, toReserveSubtraction.amount));
    toReserve.subtract(toReserveSubtraction);
    await this.reserveRepository.updateReserve(fromReserve);
    await this.reserveRepository.updateReserve(toReserve);
  }

  private logExchange(fromCurrency: Currency, toCurrency: Currency, fromAmount: number, toAmount: number): void {
    this.logger.log(`Trade executed: ${fromAmount} ${fromCurrency.code} to ${toAmount} ${toCurrency.code}`);
  }

  private emitReserveChangeEvent(fromReserve: Reserve, toReserve: Reserve): void {
    this.eventEmitter.emit(EventNames.RESERVE_CHANGE, [fromReserve, toReserve]);
  }

  // Using Serializable isolation level for the following reasons:
  // 1. Currency exchange operations involve simultaneous changes to multiple reserves, requiring strong data consistency.
  // 2. In high-concurrency scenarios, lower isolation levels may lead to frequent transaction conflicts and retries, potentially reducing overall efficiency.
  // 3. Serializable isolation ensures transactions are executed in order, avoiding complex conflict resolution logic.
  // 4. While it may slightly impact performance, data accuracy is more critical than performance in financial transactions.
  // 5. In situations where conflicts are expected to be common, using the highest isolation level can reduce the number of retries, potentially improving overall throughput.
}
