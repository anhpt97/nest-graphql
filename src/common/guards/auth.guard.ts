import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { getRequest } from '~/utils';
import { ErrorCode } from '../enums';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(ctx: GqlExecutionContext) {
    const req = getRequest(ctx);
    try {
      req.user = this.jwtService.verify(
        req.headers.authorization.replace('Bearer ', ''),
      );
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(ErrorCode.EXPIRED_TOKEN);
      }
      throw new UnauthorizedException(ErrorCode.INVALID_TOKEN);
    }
    return true;
  }
}
