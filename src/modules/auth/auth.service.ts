import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { ErrorCode } from '~/common/enums';
import { UserRepository } from '~/repositories';
import { LoginInput } from './auth.dto';
import { LoginResponse } from './auth.model';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
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
      throw new BadRequestException(ErrorCode.INCORRECT_PASSWORD);
    }
    return new LoginResponse({
      accessToken: this.jwtService.sign({
        id: user.id,
        username: user.username,
        role: user.role,
      }),
    });
  }
}
