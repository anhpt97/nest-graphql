import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ErrorMessage, UserStatus } from '~/common/enums';
import { IUser } from '~/common/interfaces';
import { User } from '~/entities';
import { UserRepository } from '~/repositories';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({
      select: ['id', 'username', 'passwordHash', 'role', 'status'],
      where: [{ username }, { email: username }],
    });
    this.validateUser(user);
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      throw new BadRequestException(ErrorMessage.INVALID_PASSWORD);
    }
    return this.tokenService.createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  }

  async refreshToken(refreshToken: string) {
    const payload: IUser = await this.tokenService.decodeToken(refreshToken);
    if (!payload) {
      throw new BadRequestException(ErrorMessage.INVALID_PAYLOAD);
    }
    const user = await this.userRepository.findOne({ id: payload.id });
    this.validateUser(user);
    void this.tokenService.deleteToken(refreshToken);
    return this.tokenService.createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  }

  private validateUser(user: User) {
    if (!user) {
      throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
    }
    if (user.status === UserStatus.NOT_ACTIVATED) {
      throw new UnauthorizedException(ErrorMessage.USER_NOT_ACTIVATED);
    }
    if (user.status === UserStatus.IS_DISABLED) {
      throw new ForbiddenException(ErrorMessage.DISABLED_USER);
    }
  }
}
