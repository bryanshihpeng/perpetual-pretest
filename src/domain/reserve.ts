import { Currency } from './currency';
import Dinero from 'dinero.js';

export class Reserve  {
  currency: Currency;
  amount: number;
  private _dinero: Dinero.Dinero;

  constructor(currency: Currency, amount: number) {
    this.currency = currency;
    this.amount = amount;
    this._dinero = Dinero({ amount: amount });
  }
}
