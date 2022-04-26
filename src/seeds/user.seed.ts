import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { Seeder } from 'typeorm-seeding';
import { UserRole, UserStatus } from '~/common/enums';
import { User } from '~/entities';

export default class CreateUsers implements Seeder {
  async run() {
    const user = await getRepository(User).findOne({
      id: '1000000000000000000',
    });
    await getRepository(User).save({
      ...user,
      id: '1000000000000000000',
      username: 'superadmin',
      passwordHash: bcrypt.hashSync('123456', 10),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
  }
}
