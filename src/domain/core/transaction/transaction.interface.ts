export interface ITransactionManager {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export const ITransactionManager = Symbol('ITransactionManager');
