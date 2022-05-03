import bcrypt from 'bcrypt';
import { Command, Console, createSpinner } from 'nestjs-console';
import { getRepository } from 'typeorm';
import { UserRole, UserStatus } from '~/common/enums';
import { User } from '~/entities';

@Console()
export class ConsoleService {
  @Command({ command: 'seed' })
  async seed() {
    const spin = createSpinner();
    spin.start('Seeding...\n');
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
    spin.succeed('Finished!');
  }
}
