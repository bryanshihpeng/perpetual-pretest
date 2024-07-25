import * as Currency from 'currency.js';
import { Money } from '../core/currency/money';
import { Reserve } from '../reserve/reserve.aggregate-root';

export class ExchangeRateCalculator {
  static calculateExchangeAmount(
    fromReserve: Reserve,
    toReserve: Reserve,
    amount: number,
  ): Money {
    const Rf = Currency(fromReserve.amount, {
      precision: fromReserve.currency.precision,
    });
    const Rt = Currency(toReserve.amount, {
      precision: toReserve.currency.precision,
    });

    const x = Currency(amount, {
      precision: fromReserve.currency.precision,
    });

    // (Rf + x) * (Rt + y) = Rf * Rt
    // y = (Rf * Rt) / (Rf + x) - Rt
    const numerator = Rt.multiply(Rf);
    const denominator = Rf.add(x);
    const y = numerator.divide(denominator).subtract(Rt);

    // Round down to ensure we don't over-promise
    return new Money(toReserve.currency, Math.floor(-y.value * 100) / 100);
  }

  static calculateExchangeRate(
    fromReserve: Reserve,
    toReserve: Reserve,
    amount: number,
  ) {
    const exchangeAmount = this.calculateExchangeAmount(
      fromReserve,
      toReserve,
      amount,
    );
    return exchangeAmount.divide(amount);
  }
}
