import { ExpressContextFunctionArgument } from '@apollo/server/dist/esm/express4';
import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { ErrorCode } from '../enums';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(ctx: GqlExecutionContext) {
    const req =
      ctx.getType<GqlContextType>() === 'graphql'
        ? GqlExecutionContext.create(
            ctx,
          ).getContext<ExpressContextFunctionArgument>().req
        : ctx.switchToHttp().getRequest<Request>();
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
