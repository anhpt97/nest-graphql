import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import sentry = require('@sentry/node');
import { Response } from 'express';
import { ServerResponse } from 'http';
import { NODE_ENV, SENTRY_DSN } from '../constants';
import { NodeEnv } from '../enums';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor() {
    super();
    sentry.init({ dsn: SENTRY_DSN });
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (!(res instanceof ServerResponse)) {
      if (
        !(exception instanceof HttpException) &&
        [NodeEnv.DEVELOPMENT, NodeEnv.PRODUCTION].includes(NODE_ENV)
      ) {
        const { req } = host.switchToHttp().getNext();
        sentry.addBreadcrumb({
          message: JSON.stringify(exception),
          data: {
            authorization: req.headers.authorization,
            operation: req.body.query.replace(/\n\s*/g, ' ').slice(0, -1),
            user: req.user,
          },
        });
        sentry.captureException(exception);
      }
      throw exception;
    }

    if (exception instanceof HttpException) {
      res.status(exception.getStatus()).json(exception.getResponse());
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(exception);
    }
  }
}
