import { Injectable } from '@nestjs/common';
import { IsolationLevel } from '@mikro-orm/core';
import { ITransactionManager } from '../../../domain/core/transaction/transaction.interface';

@Injectable()
export class InMemoryTransactionManager implements ITransactionManager {
  async runInTransaction<T>(work: () => Promise<T>, isolationLevel?: IsolationLevel): Promise<T> {
    // For in-memory repository, we don't need actual transactions or isolation levels
    // Just execute the work function
    return work();
  }
}
