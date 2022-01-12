import { Topic } from '@/common/enums';
import { pubSub } from '@/common/graphql/utils';
import { User } from '@/entities';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {
  @Cron(CronExpression.EVERY_5_SECONDS)
  addUser() {
    const user: Partial<User> = {
      id: '1000000000000000000',
      username: 'superadmin',
    };
    void pubSub.publish(Topic.USER_ADDED, { userAdded: user });
  }
}
