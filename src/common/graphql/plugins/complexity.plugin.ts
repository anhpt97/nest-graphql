import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLServerListener,
  GraphQLServiceContext,
} from 'apollo-server-plugin-base';
import { GraphQLError, GraphQLSchema } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  private schema: GraphQLSchema;

  constructor(private maxComplexity = 100) {}

  serverWillStart(
    service: GraphQLServiceContext,
  ): Promise<GraphQLServerListener> | any {
    this.schema = service.schema;
  }

  requestDidStart(): Promise<GraphQLRequestListener> | any {
    const { maxComplexity, schema } = this;

    return {
      didResolveOperation: ({ request, document }) => {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });
        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
          );
        }
      },
    };
  }
}
