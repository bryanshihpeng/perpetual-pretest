import * as C from 'currency.js';
import { Currency } from './currency';

export class Money {
  private readonly _amount: C;

  constructor(
    public readonly currency: Currency,
    amount: number,
  ) {
    this._amount = C(amount, {
      precision: currency.precision,
    });
  }

  get amount(): number {
    return this._amount.value;
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency.code !== other.currency.code) {
      throw new Error(
        `Cannot perform operation with different currencies: ${this.currency.code} and ${other.currency.code}`,
      );
    }
  }

  private createNew(amount: C): Money {
    return new Money(this.currency, amount.value);
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return this.createNew(this._amount.add(other._amount));
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return this.createNew(this._amount.subtract(other._amount));
  }

  toString(): string {
    return `${this.amount} ${this.currency.code}`;
  }
}
