export enum IsolationLevel {
  READ_UNCOMMITTED = 'read uncommitted',
  READ_COMMITTED = 'read committed',
  SNAPSHOT = 'snapshot',
  REPEATABLE_READ = 'repeatable read',
  SERIALIZABLE = 'serializable',
}
