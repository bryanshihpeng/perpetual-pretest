import { Injectable } from '@nestjs/common';
import { Currency } from '../../../domain/core/currency/currency';
import { Reserve } from '../../../domain/reserve/reserve.aggregate-root';
import { IReserveRepository } from '../../../domain/reserve/reserve.repository.interface';

@Injectable()
export class InMemoryReserveRepository implements IReserveRepository {
  private reserves: Map<string, Reserve> = new Map();

  constructor() {
    const twdInitialReserve = 10000;
    const usdInitialReserve = 10000;

    this.reserves.set(
      'TWD',
      new Reserve(
        new Currency('New Taiwan Dollar', 'TWD', 0),
        twdInitialReserve,
      ),
    );
    this.reserves.set(
      'USD',
      new Reserve(new Currency('US Dollar', 'USD', 2), usdInitialReserve),
    );
  }

  async getReserve(currency: Currency): Promise<Reserve> {
    const reserve = this.reserves.get(currency.code);
    if (!reserve) {
      throw new Error('Unsupported currency');
    }
    return reserve;
  }

  async updateReserve(reserve: Reserve): Promise<void> {
    this.reserves.set(reserve.currency.code, reserve);
  }

  async getAllReserves(): Promise<{ [key: string]: number }> {
    return Object.fromEntries(
      Array.from(this.reserves.entries()).map(([symbol, reserve]) => [
        symbol,
        reserve.amount,
      ]),
    );
  }
}
