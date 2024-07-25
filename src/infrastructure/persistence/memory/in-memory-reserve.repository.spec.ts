import { Test, TestingModule } from '@nestjs/testing';
import { Currency } from '../../../domain/core/currency/currency';
import { Money } from '../../../domain/core/currency/money';
import { InMemoryReserveRepository } from './in-memory-reserve.repository';

describe('InMemoryReserveRepository', () => {
  let repository: InMemoryReserveRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryReserveRepository],
    }).compile();

    repository = module.get<InMemoryReserveRepository>(
      InMemoryReserveRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getReserve', () => {
    it('should return the correct reserve for a supported currency', async () => {
      const twdCurrency = new Currency('New Taiwan Dollar', 'TWD', 0);
      const reserve = await repository.getReserve(twdCurrency);
      expect(reserve.currency).toEqual(twdCurrency);
      expect(reserve.amount).toBe(10000);
    });

    it('should throw an error for an unsupported currency', async () => {
      const eurCurrency = new Currency('Euro', 'EUR', 2);
      await expect(repository.getReserve(eurCurrency)).rejects.toThrow(
        'Unsupported currency',
      );
    });
  });

  describe('updateReserve', () => {
    it('should update the reserve amount', async () => {
      const usdCurrency = new Currency('US Dollar', 'USD', 2);
      const initialReserve = await repository.getReserve(usdCurrency);
      const newAmount = 15000;
      initialReserve.add(
        new Money(usdCurrency, newAmount - initialReserve.amount),
      );
      await repository.updateReserve(initialReserve);

      const updatedReserve = await repository.getReserve(usdCurrency);
      expect(updatedReserve.amount).toBe(newAmount);
    });
  });

  describe('getAllReserves', () => {
    it('should return all reserves', async () => {
      const reserves = await repository.getAllReserves();
      expect(reserves).toEqual({
        TWD: 10000,
        USD: 10000,
      });
    });
  });
});
