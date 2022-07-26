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
import { Request, Response } from 'express';
import _ from 'lodash';
import { NODE_ENV, SENTRY_DSN } from '../constants';
import { ErrorMessage, NodeEnv } from '../enums';

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  constructor() {
    sentry.init({
      dsn: SENTRY_DSN,
      normalizeDepth: 10,
    });
  }

  catch(exception: any, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() === 'graphql') {
      const { response } = exception;

      if (
        !response &&
        [(NodeEnv.DEVELOPMENT, NodeEnv.PRODUCTION)].includes(NODE_ENV)
      ) {
        const ctx = GqlArgumentsHost.create(host).getContext<ExpressContext>();
        sentry.setExtras({
          authorization: ctx.req.headers.authorization,
          body: {
            query: ctx.req.body.query,
            variables: ctx.req.body.variables,
          },
          variables: ctx.req.body.variables,
        });
        sentry.captureException(exception);
      }

      if (response && Array.isArray(response.message)) {
        response.error = this.exceptionFactory(response.message);
        response.message = ErrorMessage.INVALID_ARGUMENT_VALUE;
        exception.message = ErrorMessage.INVALID_ARGUMENT_VALUE;
      }
      return exception;
    }

    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    if ([NodeEnv.DEVELOPMENT, NodeEnv.PRODUCTION].includes(NODE_ENV)) {
      const { body, headers, ip, method, originalUrl, params, query, user } =
        req;
      sentry.setExtras({
        authorization: headers.authorization,
        body,
        ip,
        method,
        params,
        query,
        url: headers.origin + originalUrl,
        user,
      });
      sentry.captureException(exception);
    }

    if (NODE_ENV === NodeEnv.PRODUCTION) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
      return;
    }
    if (exception instanceof HttpException) {
      const { message }: any = exception.getResponse();
      if (Array.isArray(message)) {
        res.status(exception.getStatus()).json({
          statusCode: exception.getStatus(),
          error: this.exceptionFactory(message),
        });
        return;
      }
      res.status(exception.getStatus()).json(exception.getResponse());
      return;
    }
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: exception.message, ...exception });
  }

  exceptionFactory(messages: string[]): {
    field: string;
    message: string;
  }[] {
    const fields = _.uniq(messages.map((message) => message.split(' ')[0]));
    return fields.map((field) => ({
      field,
      message: messages
        .filter((message) => message.startsWith(field))
        .join('; '),
    }));
  }
}
