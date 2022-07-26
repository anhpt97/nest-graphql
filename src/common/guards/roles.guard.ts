import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ExpressContext } from 'apollo-server-express';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators';
import { ErrorMessage, UserRole } from '../enums';
import { JwtClaims } from '../interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles =
      this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (context.getType<GqlContextType>() === 'graphql') {
      const ctx =
        GqlExecutionContext.create(context).getContext<ExpressContext>();
      if (!roles.includes((ctx.req.user as JwtClaims).role)) {
        throw new ForbiddenException(ErrorMessage.PERMISSION_DENIED);
      }
      return true;
    }

    const { user } = context.switchToHttp().getRequest<Request>();
    if (!roles.includes((user as JwtClaims).role)) {
      throw new ForbiddenException(ErrorMessage.PERMISSION_DENIED);
    }
    return true;
  }
}
