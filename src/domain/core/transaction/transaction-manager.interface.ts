import { IsolationLevel } from './isolation-level.enum';

export interface ITransactionManager {
  runInTransaction<T>(
    work: () => Promise<T>,
    isolationLevel?: IsolationLevel,
  ): Promise<T>;
}

export const ITransactionManager = Symbol('ITransactionManager');
