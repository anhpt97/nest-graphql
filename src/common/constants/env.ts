import { NodeEnv } from '../enums';

export const PORT = Number(process.env.PORT);

export const NODE_ENV = process.env.NODE_ENV as NodeEnv;

export const APP_NAME = process.env.APP_NAME;

export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = Number(process.env.DB_PORT);
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_SYNC = process.env.DB_SYNC;

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN =
  Number(process.env.JWT_EXPIRES_IN) || process.env.JWT_EXPIRES_IN;

export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = Number(process.env.REDIS_PORT);

export const REFRESH_TOKEN_TTL = eval(process.env.REFRESH_TOKEN_TTL);

export const SENTRY_DSN = process.env.SENTRY_DSN;
