export declare enum IsolationLevel {
  READ_UNCOMMITTED = 'read uncommitted',
  READ_COMMITTED = 'read committed',
  SNAPSHOT = 'snapshot',
  REPEATABLE_READ = 'repeatable read',
  SERIALIZABLE = 'serializable',
}

export interface ITransactionManager {
  runInTransaction<T>(
    work: () => Promise<T>,
    isolationLevel?: IsolationLevel,
  ): Promise<T>;
}

export const ITransactionManager = Symbol('ITransactionManager');
