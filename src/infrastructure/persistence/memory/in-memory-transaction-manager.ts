import { Injectable } from '@nestjs/common';
import { ITransactionManager } from '../../../domain/core/transaction/transaction-manager.interface';

@Injectable()
export class InMemoryTransactionManager implements ITransactionManager {
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    // For in-memory repository, we don't need actual transactions or isolation levels
    // Just execute the work function
    return work();
  }
}
