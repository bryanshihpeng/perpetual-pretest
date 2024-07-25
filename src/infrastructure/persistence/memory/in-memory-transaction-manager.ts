import { Injectable } from '@nestjs/common';
import { ITransactionManager } from '../../../domain/core/transaction/transaction.interface';

@Injectable()
export class InMemoryTransactionManager implements ITransactionManager {
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    // For in-memory repository, we don't need actual transactions
    // Just execute the work function
    return work();
  }
}
