import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { ExpressContext } from 'apollo-server-express';
import { IncomingMessage } from 'http';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx =
      GqlExecutionContext.create(context).getContext<ExpressContext>();
    return ctx.req instanceof IncomingMessage ? ctx.req : ctx;
  }
}
