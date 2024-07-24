import { Test, TestingModule } from '@nestjs/testing';
import { Currency } from '../domain/core/currency/currency';
import { IReserveRepository } from '../domain/reserve/reserve.repository.interface';
import { InMemoryReserveRepository } from '../infrastructure/persistence/memory/in-memory-reserve.repository';
import { EventEmitter2 } from 'eventemitter2';
import { ExchangeService } from './exchange.service';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let reserveRepository: IReserveRepository;

  const twdCurrency = new Currency('New Taiwan Dollar', 'TWD', 0);
  const usdCurrency = new Currency('US Dollar', 'USD', 2);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        {
          provide: IReserveRepository,
          useClass: InMemoryReserveRepository,
        },
        EventEmitter2,
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    reserveRepository = module.get<IReserveRepository>(IReserveRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exchange', () => {
    it('should exchange currency successfully', async () => {
      const result = await service.exchange(twdCurrency, usdCurrency, 1000);

      expect(result).toBeCloseTo(909.09, 2);

      const twdReserve = await reserveRepository.getReserve(twdCurrency);
      const usdReserve = await reserveRepository.getReserve(usdCurrency);

      expect(twdReserve.amount).toBe(11000);
      expect(usdReserve.amount).toBeCloseTo(9090.91, 2);
    });

    it('should throw an error if trade amount is not positive', async () => {
      await expect(
        service.exchange(twdCurrency, usdCurrency, 0),
      ).rejects.toThrow('Trade amount must be positive');
    });

    it('should throw an error if there is insufficient reserve', async () => {
      // First, deplete most of the USD reserve
      await service.exchange(twdCurrency, usdCurrency, 9900);

      // Now try to exchange more than the remaining reserve
      await expect(
        service.exchange(twdCurrency, usdCurrency, 200),
      ).rejects.toThrow('Insufficient reserve for the trade');
    });
  });
});
