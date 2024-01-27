import { BadRequestException, Injectable } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { ErrorCode } from '~/common/enums';
import { UserRepository } from '~/repositories';
import { LoginInput } from './auth.dto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
  ) {}

  async login({ username, password }: LoginInput) {
    const user = await this.userRepository.findOne(
      {
        select: ['id', 'username', 'hashedPassword', 'role'],
        where: [{ username }, { email: username }],
      },
      true,
    );
    if (!compareSync(password, user.hashedPassword)) {
      throw new BadRequestException(ErrorCode.INVALID_PASSWORD);
    }
    return this.tokenService.create({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  }
}
