import { Injectable } from '@nestjs/common';
import { EntityManager, IsolationLevel } from '@mikro-orm/core';
import { ITransactionManager } from '../../../domain/core/transaction/transaction.interface';

@Injectable()
export class MikroOrmTransactionManager implements ITransactionManager {
  constructor(private readonly em: EntityManager) {}

  async runInTransaction<T>(work: () => Promise<T>, isolationLevel: IsolationLevel = IsolationLevel.SERIALIZABLE): Promise<T> {
    return this.em.transactional(work, {
      isolationLevel,
    });
  }
}
