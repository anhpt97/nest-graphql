import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import { GraphQLError } from 'graphql';
import { IncomingHttpHeaders } from 'http';
import { NODE_ENV } from './common/constants';
import { ErrorMessage, NodeEnv } from './common/enums';
import { ComplexityPlugin } from './common/graphql/plugins';

const gqlconfig: ApolloDriverConfig = {
  driver: ApolloDriver,
  fieldResolverEnhancers: ['guards'],
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
    if (NODE_ENV === NodeEnv.PRODUCTION) {
      delete error.extensions.exception;
    }
    return error;
  },
};
export default gqlconfig;
