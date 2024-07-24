import { Currency } from '../core/currency/currency';
import { Reserve } from './reserve.aggregate-root';

export interface IReserveRepository {
  getReserve(currency: Currency): Promise<Reserve>;

  updateReserve(reserve: Reserve): Promise<void>;

  getAllReserves(): Promise<{ [key: string]: number }>;
}

export const IReserveRepository = Symbol('IReserveRepository');
