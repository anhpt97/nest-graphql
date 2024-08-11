import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getRequest } from '~/utils';

export const CurrentUser = createParamDecorator(
  (_, ctx: GqlExecutionContext) => {
    const { user } = getRequest(ctx);
    return user;
  },
);
