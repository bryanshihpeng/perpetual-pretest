import { IsolationLevel } from '@mikro-orm/core';

export interface ITransactionManager {
  runInTransaction<T>(work: () => Promise<T>, isolationLevel?: IsolationLevel): Promise<T>;
}

export const ITransactionManager = Symbol('ITransactionManager');
