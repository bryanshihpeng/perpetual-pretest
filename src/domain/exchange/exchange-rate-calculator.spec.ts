import { Currency } from '../core/currency/currency';
import { Money } from '../core/currency/money';
import { Reserve } from '../reserve/reserve.aggregate-root';
import { ExchangeRateCalculator } from './exchange-rate-calculator';

describe('ExchangeRateCalculator', () => {
  const twdCurrency = new Currency('New Taiwan Dollar', 'TWD', 0);
  const usdCurrency = new Currency('US Dollar', 'USD', 2);
  describe('calculateExchangeAmount', () => {
    it('should calculate the correct exchange amount', () => {
      const fromReserve = new Reserve(twdCurrency, 10000);
      const toReserve = new Reserve(usdCurrency, 10000);
      const amount = 1000;

      const result = ExchangeRateCalculator.calculateExchangeAmount(
        fromReserve,
        toReserve,
        amount,
      );

      expect(result).toBeInstanceOf(Money);
      expect(result.currency).toBe(usdCurrency);
      expect(result.amount).toBeCloseTo(909.09, 2);
    });

    it('should handle small amounts correctly', () => {
      const fromReserve = new Reserve(twdCurrency, 10000);
      const toReserve = new Reserve(usdCurrency, 10000);
      const amount = 1;

      const result = ExchangeRateCalculator.calculateExchangeAmount(
        fromReserve,
        toReserve,
        amount,
      );

      expect(result.amount).toBeGreaterThan(0);
    });

    it('should handle large amounts correctly', () => {
      const fromReserve = new Reserve(twdCurrency, 1000000);
      const toReserve = new Reserve(usdCurrency, 1000000);
      const amount = 500000;

      const result = ExchangeRateCalculator.calculateExchangeAmount(
        fromReserve,
        toReserve,
        amount,
      );

      expect(result.amount).toBeLessThan(500000);
    });

    it('should maintain constant product after exchange', () => {
      const fromReserve = new Reserve(twdCurrency, 10000);
      const toReserve = new Reserve(usdCurrency, 10000);
      const amount = 1000;

      const result = ExchangeRateCalculator.calculateExchangeAmount(
        fromReserve,
        toReserve,
        amount,
      );

      const initialProduct = fromReserve.amount * toReserve.amount;
      const finalProduct =
        (fromReserve.amount + amount) * (toReserve.amount - result.amount);

      expect(finalProduct).toBeCloseTo(initialProduct, 5);
    });
  });
});
