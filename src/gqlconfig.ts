import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HttpStatus } from '@nestjs/common';
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import { GraphQLError } from 'graphql';
import { IncomingHttpHeaders } from 'http';
import _ from 'lodash';
import { NODE_ENV } from './common/constants';
import { ErrorMessage, NodeEnv } from './common/enums';
import { ComplexityPlugin } from './common/graphql/plugins';

const gqlconfig: ApolloDriverConfig = {
  driver: ApolloDriver,
  fieldResolverEnhancers: ['guards', 'interceptors', 'filters'],
  autoSchemaFile: true,
  // cors: true,
  subscriptions: {
    'subscriptions-transport-ws': {
      onConnect: (headers: IncomingHttpHeaders) => {
        if (!headers.authorization) {
          if (!headers.Authorization) {
            throw new Error(ErrorMessage.TOKEN_NOT_FOUND);
          } else {
            headers.authorization = headers.Authorization as string;
          }
        }
        return { headers };
      },
    },
  },
  playground: false,
  introspection: NODE_ENV !== NodeEnv.PRODUCTION,
  plugins: [
    NODE_ENV !== NodeEnv.PRODUCTION
      ? ApolloServerPluginLandingPageLocalDefault()
      : ApolloServerPluginLandingPageDisabled(),
    new ComplexityPlugin(100),
  ],
  formatError: (error: GraphQLError) => {
    const { response }: any = error.extensions;
    if (Array.isArray(response.message)) {
      const messages: string[] = response.message;
      const fields = _.uniq(messages.map((message) => message.split(' ')[0]));
      response.error = fields.map((field) => ({
        field,
        message: messages
          .filter((message) => message.startsWith(field))
          .join('; '),
      }));
      response.message = undefined;
      error.message = 'Invalid argument value';
    }
    if (Number(error.extensions.code) === HttpStatus.NOT_FOUND) {
      error.extensions.code = HttpStatus[HttpStatus.NOT_FOUND];
    }
    if (NODE_ENV === NodeEnv.PRODUCTION) {
      delete error.extensions.exception;
    }
    return error;
  },
};
export default gqlconfig;
