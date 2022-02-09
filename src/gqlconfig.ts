import { GqlModuleOptions } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { IncomingHttpHeaders } from 'http';
import { NODE_ENV } from './common/constants';
import { ErrorMessage, NodeEnv } from './common/enums';
import { ComplexityPlugin } from './common/graphql/plugins';

const gqlconfig: GqlModuleOptions = {
  // cors: true,
  fieldResolverEnhancers: ['guards', 'interceptors', 'filters'],
  autoSchemaFile: true,
  plugins: [new ComplexityPlugin(100)],
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
  introspection: NODE_ENV !== NodeEnv.PRODUCTION,
  playground: NODE_ENV !== NodeEnv.PRODUCTION,
  formatError: (error: GraphQLError) => {
    if (NODE_ENV === NodeEnv.PRODUCTION) {
      delete error.extensions.exception;
    }
    return error;
  },
};
export default gqlconfig;
