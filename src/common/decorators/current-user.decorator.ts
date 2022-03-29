import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ExpressContext } from 'apollo-server-express';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    if (context.getType<GqlContextType>() === 'graphql') {
      const ctx =
        GqlExecutionContext.create(context).getContext<ExpressContext>();
      return ctx.req.user;
    }
    const req = context.switchToHttp().getRequest<Request>();
    return req.user;
  },
);
