import { Currency } from '../core/currency/currency';
import { Money } from '../core/currency/money';

export class Reserve {
  private _currencyHolder: Money;

  constructor(currency: Currency, amount: number) {
    this._currencyHolder = new Money(currency, amount);
  }

  get currency(): Currency {
    return this._currencyHolder.currency;
  }

  get amount(): number {
    return this._currencyHolder.amount;
  }

  add(amount: Money): void {
    this._currencyHolder = this._currencyHolder.add(amount);
  }

  subtract(amount: Money): void {
    this._currencyHolder = this._currencyHolder.subtract(amount);
  }
}
