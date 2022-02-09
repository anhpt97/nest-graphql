import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  GqlArgumentsHost,
  GqlContextType,
  GqlExceptionFilter,
} from '@nestjs/graphql';
import sentry = require('@sentry/node');
import { ExpressContext } from 'apollo-server-express';
import { Response } from 'express';
import { NODE_ENV, SENTRY_DSN } from '../constants';
import { NodeEnv } from '../enums';

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  constructor() {
    sentry.init({ dsn: SENTRY_DSN });
  }

  catch(exception: any, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() === 'graphql') {
      if (
        !(exception instanceof HttpException) &&
        [NodeEnv.DEVELOPMENT, NodeEnv.PRODUCTION].includes(NODE_ENV)
      ) {
        const ctx = GqlArgumentsHost.create(host).getContext<ExpressContext>();
        sentry.addBreadcrumb({
          message: JSON.stringify(exception),
          data: {
            authorization: ctx.req.headers.authorization,
            operation: ctx.req.body.query.replace(/\n\s*/g, ' ').trim(),
            user: ctx.req.user,
          },
        });
        sentry.captureException(exception);
      }
      return exception;
    }

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      res.status(exception.getStatus()).json(exception.getResponse());
    } else {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: exception.message, ...exception });
    }
  }
}
