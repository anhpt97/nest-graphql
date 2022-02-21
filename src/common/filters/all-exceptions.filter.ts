import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import {
  GqlArgumentsHost,
  GqlContextType,
  GqlExceptionFilter,
} from '@nestjs/graphql';
import sentry = require('@sentry/node');
import { ExpressContext } from 'apollo-server-express';
import { Request, Response } from 'express';
import { NODE_ENV, SENTRY_DSN } from '../constants';
import { NodeEnv } from '../enums';

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  constructor() {
    sentry.init({ dsn: SENTRY_DSN });
  }

  catch(exception: any, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() === 'graphql') {
      if ([NodeEnv.DEVELOPMENT, NodeEnv.PRODUCTION].includes(NODE_ENV)) {
        const ctx = GqlArgumentsHost.create(host).getContext<ExpressContext>();
        sentry.setExtra('query', ctx.req.body.query);
        sentry.setExtra('variables', ctx.req.body.variables);
        sentry.addBreadcrumb({
          message: JSON.stringify(exception),
          data: {
            authorization: ctx.req.headers.authorization,
            body: {
              query: ctx.req.body.query,
              variables: JSON.stringify(ctx.req.body.variables),
            },
            user: ctx.req.user,
          },
        });
        sentry.captureException(exception);
      }
      return exception;
    }

    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    if ([NodeEnv.DEVELOPMENT, NodeEnv.PRODUCTION].includes(NODE_ENV)) {
      const { body, headers, ip, method, originalUrl, params, query, user } =
        req;
      sentry.addBreadcrumb({
        message: JSON.stringify(exception),
        data: {
          authorization: headers.authorization,
          body,
          ip,
          method,
          params,
          query,
          url: headers.origin + originalUrl,
          user,
        },
      });
      sentry.captureException(exception);
    }

    if (NODE_ENV !== NodeEnv.PRODUCTION) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: exception.message, ...exception });
    } else {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
