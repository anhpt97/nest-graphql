import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ErrorMessage, Message } from '~/common/enums';
import { User } from '~/entities';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async whoAmI(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
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
      select: ['id', 'hashedPassword'],
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
    }
    if (!bcrypt.compareSync(currentPassword, user.hashedPassword)) {
      throw new BadRequestException(ErrorMessage.INVALID_PASSWORD);
    }
    void this.userRepository.update(
      { id: user.id },
      { hashedPassword: bcrypt.hashSync(newPassword, 10) },
    );
    return { message: Message.SUCCESSFUL_PASSWORD_RESET };
  }
}
