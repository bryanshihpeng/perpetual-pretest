import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Currency } from '../domain/core/currency/currency';
import { Money } from '../domain/core/currency/money';
import { ITransactionManager } from '../domain/core/transaction/transaction.interface';
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
          const updatedReserves = await this.reserveRepository.getAllReserves();
          this.eventEmitter.emit('reserveChange', updatedReserves);

          return toReserveSubtraction.amount;
        });
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
