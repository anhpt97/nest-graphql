import { Injectable } from '@nestjs/common';
import { JwtPayload } from '~/common/models';
import { UserRepository } from '~/repositories';

@Injectable()
export class MeService {
  constructor(private userRepository: UserRepository) {}

  whoAmI({ id }: JwtPayload) {
    return this.userRepository.findOne({ where: { id } }, true);
  }
}
