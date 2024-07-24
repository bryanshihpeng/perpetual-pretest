import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Currency } from '../domain/core/currency/currency';
import { Money } from '../domain/core/currency/money';
import { ExchangeRateCalculator } from '../domain/exchange/exchange-rate-calculator';
import { IReserveRepository } from '../domain/reserve/reserve.repository.interface';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);

  constructor(
    @Inject(IReserveRepository)
    private readonly reserveRepository: IReserveRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async exchange(
    fromCurrency: Currency,
    toCurrency: Currency,
    fromCurrencyAmount: number,
  ): Promise<number> {
    if (fromCurrencyAmount <= 0) {
      throw new Error('Trade amount must be positive');
    }

    const money = new Money(fromCurrency, fromCurrencyAmount);

    const fromReserve = await this.reserveRepository.getReserve(fromCurrency);
    const toReserve = await this.reserveRepository.getReserve(toCurrency);

    const toReserveSubtraction = ExchangeRateCalculator.calculateExchangeAmount(
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
  }
}
