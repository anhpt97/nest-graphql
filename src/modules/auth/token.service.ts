import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { REFRESH_TOKEN_TTL } from '~/common/constants';
import { ErrorMessage } from '~/common/enums';
import { JwtClaims } from '~/common/interfaces';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  createToken(payload: JwtClaims, getRefreshToken = true) {
    const accessToken = this.jwtService.sign(payload);
    if (!getRefreshToken) {
      return { accessToken };
    }
    const refreshToken = randomUUID();
    void this.redisService.set(refreshToken, accessToken, REFRESH_TOKEN_TTL);
    return { accessToken, refreshToken };
  }

  async verifyToken(refreshToken: string) {
    const accessToken = await this.redisService.get(refreshToken);
    if (!accessToken) {
      throw new UnauthorizedException(ErrorMessage.TOKEN_NOT_FOUND);
    }
    try {
      return this.jwtService.verify(accessToken, {
        ignoreExpiration: true,
      });
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  deleteToken(refreshToken: string) {
    void this.redisService.del(refreshToken);
  }
}
