import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_SYNC,
  DB_USERNAME,
  NODE_ENV,
} from './common/constants';
import { NodeEnv } from './common/enums';

const ormconfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  autoLoadEntities: true,
  synchronize: DB_SYNC === 'true',
  logging: true,
  logger: [NodeEnv.DEVELOPMENT, NodeEnv.PRODUCTION].includes(NODE_ENV)
    ? 'simple-console'
    : 'advanced-console',
  migrationsTableName: 'migration',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: __dirname + '/migrations',
  },
};
export default ormconfig;
