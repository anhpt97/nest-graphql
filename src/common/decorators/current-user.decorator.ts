import { ExpressContextFunctionArgument } from '@apollo/server/dist/esm/express4';
import { createParamDecorator } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_, ctx: GqlExecutionContext) => {
    const { user } =
      ctx.getType<GqlContextType>() === 'graphql'
        ? GqlExecutionContext.create(
            ctx,
          ).getContext<ExpressContextFunctionArgument>().req
        : ctx.switchToHttp().getRequest<Request>();
    return user;
  },
);
