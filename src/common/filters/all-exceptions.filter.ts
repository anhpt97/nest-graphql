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
import { NodeEnv } from '../enums';

const INVALID_ARGUMENT_VALUE = 'Invalid argument value';

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
        const message: string[] = response.message;
        const fields = _.uniq(message.map((msg) => msg.split(' ')[0]));
        response.error = fields.map((field) => ({
          field,
          message: message.filter((msg) => msg.startsWith(field)).join('; '),
        }));
        response.message = INVALID_ARGUMENT_VALUE;
        exception.message = INVALID_ARGUMENT_VALUE;
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
        const fields = _.uniq(message.map((msg) => msg.split(' ')[0]));
        res.status(exception.getStatus()).json({
          statusCode: exception.getStatus(),
          error: fields.map((field) => ({
            field,
            message: message.filter((msg) => msg.startsWith(field)).join('; '),
          })),
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
}
