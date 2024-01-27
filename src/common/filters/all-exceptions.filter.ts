import { ExpressContextFunctionArgument } from '@apollo/server/dist/esm/express4';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpExceptionBody,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  GqlArgumentsHost,
  GqlContextType,
  GqlExceptionFilter,
} from '@nestjs/graphql';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {
  GraphQLError,
  GraphQLErrorExtensions as _GraphQLErrorExtensions,
} from 'graphql';
import { t } from 'i18next';
import { Logger, createLogger, format } from 'winston';
import { File } from 'winston/lib/winston/transports';
import { NODE_ENV } from '../constants';
import { ErrorCode, NodeEnv } from '../enums';
import { Error, Response, ValidationError } from '../models';

interface GraphQLErrorExtensions extends _GraphQLErrorExtensions {
  code: ApolloServerErrorCode;
  error: Error;
}

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      format: format.printf(
        ({ message }) => `${new Date().toISOString()} — ${message}`,
      ),
      transports: new File({ filename: 'error.log', dirname: 'logs' }),
    });
  }

  catch(exception: any, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() === 'graphql') {
      const gqlHost = GqlArgumentsHost.create(host);
      const { req } = gqlHost.getContext<ExpressContextFunctionArgument>();

      if (exception instanceof GraphQLError) {
        const message = t(exception.toString());
        return new GraphQLError(message, {
          extensions: {
            code: ErrorCode[exception.toString()]
              ? ApolloServerErrorCode.BAD_REQUEST
              : ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
            error: {
              code: exception.message,
              message,
              details: [],
            },
          } as GraphQLErrorExtensions,
        });
      }

      if (
        exception instanceof HttpException &&
        !(exception instanceof InternalServerErrorException)
      ) {
        const response = exception.getResponse() as HttpExceptionBody;
        const message = Array.isArray(response.message)
          ? t(ErrorCode.INVALID_ARGUMENT_VALUE)
          : t(response.message);
        return new GraphQLError(message, {
          extensions: {
            code: Array.isArray(response.message)
              ? ApolloServerErrorCode.BAD_USER_INPUT
              : ApolloServerErrorCode.BAD_REQUEST,
            error: Array.isArray(response.message)
              ? {
                  code: ErrorCode.INVALID_ARGUMENT_VALUE,
                  message,
                  details: this.transformErrorMessages(response.message),
                }
              : {
                  code: response.message,
                  message,
                  details: [],
                },
          } as GraphQLErrorExtensions,
        });
      }

      this.log({ error: exception, host, request: req });

      if (NODE_ENV === NodeEnv.PRODUCTION) {
        const code = ErrorCode.INTERNAL_SERVER_ERROR;
        const message = t(code);
        return new GraphQLError(message, {
          extensions: {
            code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
            error: { code, message, details: [] },
          } as GraphQLErrorExtensions,
        });
      }
      if (typeof exception.getResponse === 'function') {
        const response = exception.getResponse();
        return new GraphQLError(response.message, {
          extensions: {
            code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
            error: response,
          } as GraphQLErrorExtensions,
        });
      }
      return new GraphQLError(exception.toString(), {
        extensions: {
          code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
          error: exception,
        } as GraphQLErrorExtensions,
      });
    }

    const ctx = host.switchToHttp();
    const req = ctx.getRequest<ExpressRequest>();
    const res = ctx.getResponse<ExpressResponse>();

    if (
      exception instanceof HttpException &&
      !(exception instanceof InternalServerErrorException)
    ) {
      const response = exception.getResponse() as HttpExceptionBody;
      res.status(exception.getStatus()).json(
        (Array.isArray(response.message)
          ? {
              error: {
                code: ErrorCode.INVALID_INPUT,
                message: t(ErrorCode.INVALID_INPUT),
                details: this.transformErrorMessages(response.message),
              },
            }
          : {
              error: {
                code: response.message,
                message: t(response.message),
                details: [],
              },
            }) as Response,
      );
      return;
    }

    this.log({ error: exception, host, request: req });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      (NODE_ENV === NodeEnv.PRODUCTION
        ? {
            error: {
              code: ErrorCode.INTERNAL_SERVER_ERROR,
              message: t(ErrorCode.INTERNAL_SERVER_ERROR),
              details: [],
            },
          }
        : typeof exception.getResponse === 'function'
          ? { error: exception.getResponse() }
          : {
              error: { ...exception, message: exception.toString() },
            }) as Response,
    );
  }

  private log({
    error,
    host,
    request: {
      headers: { authorization, origin },
      ip,
      body,
      method,
      params,
      query,
      originalUrl,
      user,
    },
  }: {
    error: Error;
    host: ArgumentsHost;
    request: ExpressRequest;
  }) {
    this.logger.log({
      level: 'error',
      message: JSON.stringify({
        error: JSON.parse(
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
        ),
        request:
          host.getType<GqlContextType>() === 'graphql'
            ? { body, headers: { authorization } }
            : {
                body,
                headers: { authorization },
                ip,
                method,
                params,
                query,
                url: `${origin}${originalUrl}`,
                user,
              },
      }),
    });
  }

  private transformErrorMessages(messages: string[]): ValidationError[] {
    return messages.map((message) => {
      message = message.replace(/(\.)(0|[1-9]\d*)(\.|$)/g, '[$2]$3');
      if (message.includes('each value in ')) {
        message = message.replace(/each value in (nested property )?/, '');
        return {
          field: message.split(' ')[0],
          message: `each value in ${message}`,
        };
      }
      return { field: message.split(' ')[0], message };
    });
  }
}
