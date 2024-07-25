import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Currency } from '../../../domain/core/currency/currency';
import { Reserve as DomainReserve } from '../../../domain/reserve/reserve.aggregate-root';
import { IReserveRepository } from '../../../domain/reserve/reserve.repository.interface';
import { ReserveEntity } from './reserve.entity';

@Injectable()
export class MikroOrmReserveRepository implements IReserveRepository {
  constructor(private readonly em: EntityManager) {}

  async createReserve(domainReserve: DomainReserve): Promise<void> {
    const reserve = new ReserveEntity({
      currencyCode: domainReserve.currency.code,
      currencyName: domainReserve.currency.name,
      precision: domainReserve.currency.precision,
      amount: domainReserve.amount,
    });
    await this.em.persistAndFlush(reserve);
  }

  async getReserve(currency: Currency): Promise<DomainReserve> {
    const reserve = await this.em.findOne(ReserveEntity, {
      currencyCode: currency.code,
    });
    if (!reserve) {
      throw new Error('Unsupported currency');
    }
    return new DomainReserve(
      new Currency(
        reserve.currencyName,
        reserve.currencyCode,
        reserve.precision,
      ),
      reserve.amount,
    );
  }

  async updateReserve(domainReserve: DomainReserve): Promise<void> {
    const reserve = await this.em.findOne(ReserveEntity, {
      currencyCode: domainReserve.currency.code,
    });
    if (!reserve) {
      throw new Error('Unsupported currency');
    }
    reserve.amount = domainReserve.amount;
    await this.em.flush();
  }

  async getAllReserves(): Promise<{ [key: string]: number }> {
    const reserves = await this.em.find(ReserveEntity, {});
    return reserves.reduce((acc, reserve) => {
      acc[reserve.currencyCode] = reserve.amount;
      return acc;
    }, {});
  }
}
