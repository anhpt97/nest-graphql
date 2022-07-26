import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '~/entities';
import { AuthService } from '~/modules/auth/auth.service';
import { JWT_SECRET } from '../constants';
import { ErrorMessage } from '../enums';
import { JwtClaims } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: JwtClaims) {
    if (payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException(ErrorMessage.EXPIRED_TOKEN);
    }
    const user = await this.userRepository.findOneBy({ id: payload.id });
    this.authService.validateUser(user);
    return payload;
  }
}
