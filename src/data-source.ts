import 'dotenv/config';
import { DataSource } from 'typeorm';
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from './common/constants';

export default new DataSource({
  type: 'mysql',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  migrationsTableName: 'migration',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
