import { ExpressContextFunctionArgument } from '@apollo/server/dist/esm/express4';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const getRequest = (ctx: GqlExecutionContext) =>
  ctx.getType<GqlContextType>() === 'graphql'
    ? GqlExecutionContext.create(
        ctx,
      ).getContext<ExpressContextFunctionArgument>().req
    : ctx.switchToHttp().getRequest<Request>();
