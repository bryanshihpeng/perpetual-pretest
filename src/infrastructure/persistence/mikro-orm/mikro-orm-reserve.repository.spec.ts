import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { Currency } from '../../../domain/core/currency/currency';
import { Reserve } from '../../../domain/reserve/reserve.aggregate-root';
import { MikroOrmReserveRepository } from './mikro-orm-reserve.repository';
import mikroOrmConfig from './mikro-orm.config';
import { ReserveEntity } from './reserve.entity';

describe('MikroOrmReserveRepository', () => {
  let repository: MikroOrmReserveRepository;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(mikroOrmConfig),
        MikroOrmModule.forFeature([ReserveEntity]),
      ],
      providers: [MikroOrmReserveRepository],
    }).compile();

    repository = module.get<MikroOrmReserveRepository>(
      MikroOrmReserveRepository,
    );
    entityManager = module.get<EntityManager>(EntityManager);

    await entityManager.nativeDelete(ReserveEntity, {});
  });

  describe('getReserve', () => {
    it('should retrieve an existing reserve', async () => {
      const currency = new Currency('US Dollar', 'USD', 2);
      await entityManager.persistAndFlush(
        new ReserveEntity({
          currencyCode: 'USD',
          currencyName: 'US Dollar',
          precision: 2,
          amount: 1000,
        }),
      );

      const reserve = await repository.getReserve(currency);

      expect(reserve).toBeDefined();
      expect(reserve.currency.code).toBe('USD');
      expect(reserve.amount).toBe(1000);
    });

    it('should throw an error for non-existent reserve', async () => {
      const currency = new Currency('Euro', 'EUR', 2);

      await expect(repository.getReserve(currency)).rejects.toThrow(
        'Unsupported currency',
      );
    });
  });

  describe('updateReserve', () => {
    it('should update an existing reserve', async () => {
      const currency = new Currency('US Dollar', 'USD', 2);
      await entityManager.persistAndFlush(
        new ReserveEntity({
          currencyCode: 'USD',
          currencyName: 'US Dollar',
          precision: 2,
          amount: 1000,
        }),
      );

      const updatedReserve = new Reserve(currency, 1500);
      await repository.updateReserve(updatedReserve);

      const retrievedReserve = await entityManager.findOne(ReserveEntity, {
        currencyCode: 'USD',
      });
      expect(retrievedReserve.amount).toBe(1500);
    });

    it('should throw an error for non-existent reserve', async () => {
      const currency = new Currency('Euro', 'EUR', 2);
      const reserve = new Reserve(currency, 1000);

      await expect(repository.updateReserve(reserve)).rejects.toThrow(
        'Unsupported currency',
      );
    });
  });

  describe('getAllReserves', () => {
    it('should retrieve all reserves', async () => {
      await entityManager.persistAndFlush([
        new ReserveEntity({
          currencyCode: 'USD',
          currencyName: 'US Dollar',
          precision: 2,
          amount: 1000,
        }),
        new ReserveEntity({
          currencyCode: 'EUR',
          currencyName: 'Euro',
          precision: 2,
          amount: 2000,
        }),
      ]);

      const reserves = await repository.getAllReserves();

      expect(reserves).toEqual({
        USD: 1000,
        EUR: 2000,
      });
    });
  });
});
