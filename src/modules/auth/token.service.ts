import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { REFRESH_TOKEN_TTL } from '~/common/constants';
import { ErrorMessage } from '~/common/enums';
import { IUser } from '~/common/interfaces';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  createToken(payload: IUser, getRefreshToken = true) {
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
    return this.jwtService.verify(null, { ignoreExpiration: true });
  }

  deleteToken(refreshToken: string) {
    void this.redisService.del(refreshToken);
  }
}
