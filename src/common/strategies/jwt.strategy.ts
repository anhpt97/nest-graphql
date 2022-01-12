import { UserRepository } from '@/repositories';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from '../constants';
import { ErrorMessage, UserStatus } from '../enums';
import { IUser } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: IUser) {
    if (payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException(ErrorMessage.EXPIRED_TOKEN);
    }
    const user = await this.userRepository.findOne({ id: payload.id });
    if (!user) {
      throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
    }
    if (user.status === UserStatus.NOT_ACTIVATED) {
      throw new UnauthorizedException(ErrorMessage.USER_NOT_ACTIVATED);
    }
    if (user.status === UserStatus.IS_DISABLED) {
      throw new ForbiddenException(ErrorMessage.DISABLED_USER);
    }
    return payload;
  }
}
