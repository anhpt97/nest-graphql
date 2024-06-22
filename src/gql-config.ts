import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { NODE_ENV } from './common/constants';
import { NodeEnv } from './common/enums';
import { ComplexityPlugin } from './common/graphql/plugins';

export const gqlConfig: ApolloDriverConfig = {
  driver: ApolloDriver,
  autoSchemaFile: true,
  fieldResolverEnhancers: ['guards', 'interceptors', 'filters'],
  subscriptions: { 'graphql-ws': true },
  context: ({
    connectionParams: headers,
    req,
  }: {
    connectionParams: IncomingHttpHeaders;
    req: Request;
  }) =>
    headers
      ? {
          req: {
            headers: Object.keys(headers).reduce(
              (acc, key) => ({ ...acc, [key.toLowerCase()]: headers[key] }),
              {},
            ),
          } as Request,
        }
      : req,
  playground: false,
  plugins: [
    NODE_ENV === NodeEnv.Production
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    new ComplexityPlugin(),
  ],
};
