import bcrypt from 'bcrypt';
import { Command, Console, createSpinner } from 'nestjs-console';
import { DataSource } from 'typeorm';
import { UserRole, UserStatus } from '~/common/enums';
import { User } from '~/entities';

@Console()
export class ConsoleService {
  constructor(private dataSource: DataSource) {}

  @Command({ command: 'seed' })
  async seed() {
    const spin = createSpinner();
    spin.start('Seeding...\n');
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOneBy({
      id: '1000000000000000000',
    });
    await userRepository.save({
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
