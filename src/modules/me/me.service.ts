import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ErrorMessage, Message } from '~/common/enums';
import { UserRepository } from '~/repositories';

@Injectable()
export class MeService {
  constructor(private readonly userRepository: UserRepository) {}

  async whoAmI(userId: string) {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
    }
    return user;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    if (newPassword === currentPassword) {
      throw new BadRequestException(ErrorMessage.INVALID_NEW_PASSWORD);
    }
    const user = await this.userRepository.findOne({
      select: ['id', 'passwordHash'],
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
    }
    if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
      throw new BadRequestException(ErrorMessage.INVALID_PASSWORD);
    }
    void this.userRepository.update(
      { id: user.id },
      { passwordHash: bcrypt.hashSync(newPassword, 10) },
    );
    return { message: Message.SUCCESSFUL_PASSWORD_RESET };
  }
}
