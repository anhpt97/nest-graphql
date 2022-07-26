import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ErrorMessage, UserStatus } from '~/common/enums';
import { JwtClaims } from '~/common/interfaces';
import { User } from '~/entities';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private tokenService: TokenService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({
      select: ['id', 'username', 'hashedPassword', 'role', 'status'],
      where: [{ username }, { email: username }],
    });
    this.validateUser(user);
    if (!bcrypt.compareSync(password, user.hashedPassword)) {
      throw new BadRequestException(ErrorMessage.INVALID_PASSWORD);
    }
    return this.tokenService.createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  }

  async refreshToken(refreshToken: string) {
    const payload: JwtClaims = await this.tokenService.verifyToken(
      refreshToken,
    );
    if (!payload?.id) {
      throw new UnauthorizedException(ErrorMessage.INVALID_TOKEN);
    }
    const user = await this.userRepository.findOneBy({ id: payload.id });
    this.validateUser(user);
    void this.tokenService.deleteToken(refreshToken);
    return this.tokenService.createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  }

  validateUser(user: User) {
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
