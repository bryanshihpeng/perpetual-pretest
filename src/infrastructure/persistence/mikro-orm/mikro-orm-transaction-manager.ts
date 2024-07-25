import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ITransactionManager } from '../../../domain/core/transaction/transaction.interface';
import { IsolationLevel } from '@mikro-orm/core';

@Injectable()
export class MikroOrmTransactionManager implements ITransactionManager {
  constructor(private readonly em: EntityManager) {}

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.em.transactional(work, {
      isolationLevel: IsolationLevel.SERIALIZABLE,
    });
  }
}
