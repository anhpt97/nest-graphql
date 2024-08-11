import {
  CanActivate,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getRequest } from '~/utils';
import { ROLES_KEY } from '../decorators';
import { ErrorCode, UserRole } from '../enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: GqlExecutionContext) {
    const { user } = getRequest(ctx);
    if (!user) {
      throw new InternalServerErrorException(ErrorCode.MISSING_JWT_VALIDATION);
    }
    const roles =
      this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) || [];
    if (!roles.includes(user.role)) {
      throw new ForbiddenException(ErrorCode.PERMISSION_DENIED);
    }
    return true;
  }
}
