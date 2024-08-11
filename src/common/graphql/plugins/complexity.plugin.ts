import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContextDidResolveOperation,
  GraphQLServerContext,
} from '@apollo/server';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { Plugin } from '@nestjs/apollo';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { getComplexity, simpleEstimator } from 'graphql-query-complexity';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  private schema: GraphQLSchema;

  private maxComplexity: number;

  constructor(options?: { maxComplexity: number }) {
    this.maxComplexity = options?.maxComplexity || 100;
  }

  serverWillStart({ schema }: GraphQLServerContext): any {
    this.schema = schema;
  }

  requestDidStart(): any {
    const { schema, maxComplexity } = this;

    return {
      didResolveOperation: ({
        request: { variables },
        document,
      }: GraphQLRequestContextDidResolveOperation<BaseContext>) => {
        const complexity = getComplexity({
          estimators: [simpleEstimator()],
          schema,
          query: document,
          variables,
        });
        if (
          !document.loc.source.body.includes('IntrospectionQuery') &&
          complexity > maxComplexity
        ) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}.`,
            { extensions: { code: ApolloServerErrorCode.BAD_REQUEST } },
          );
        }
      },
    };
  }
}
