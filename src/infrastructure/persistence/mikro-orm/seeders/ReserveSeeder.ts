import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ReserveEntity } from '../reserve.entity';
import { currencies } from '../../../../domain/core/currency/currency';

export class ReserveSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const reserves = [
      {
        currencyCode: currencies.TWD.code,
        currencyName: currencies.TWD.name,
        precision: currencies.TWD.precision,
        amount: 10000,
      },
      {
        currencyCode: currencies.USD.code,
        currencyName: currencies.USD.name,
        precision: currencies.USD.precision,
        amount: 10000,
      },
    ];

    for (const reserve of reserves) {
      const existingReserve = await em.findOne(ReserveEntity, { currencyCode: reserve.currencyCode });
      if (!existingReserve) {
        em.create(ReserveEntity, reserve);
      }
    }
  }
}
