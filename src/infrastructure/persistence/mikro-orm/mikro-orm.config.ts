import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import * as dotenv from 'dotenv';
import { ReserveEntity } from './reserve.entity';

dotenv.config();

const mikroOrmConfig: Options = {
  driver: PostgreSqlDriver,
  entities: [ReserveEntity],
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  allowGlobalContext: true,
  driverOptions: {
    connection: { ssl: process.env.DB_USE_SSL === 'true' },
  },
  migrations: {
    path: './src/infrastructure/persistence/mikro-orm/migrations',
  },
  seeder: {
    path: './src/infrastructure/persistence/mikro-orm/seeders',
    pathTs: './src/infrastructure/persistence/mikro-orm/seeders',
    defaultSeeder: 'ReserveSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
    fileName: (className: string) => className,
  },
};

export default mikroOrmConfig;
