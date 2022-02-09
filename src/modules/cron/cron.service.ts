import { Topic } from '@/common/enums';
import { pubSub } from '@/common/graphql/utils';
import { User } from '@/entities';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeepPartial } from 'typeorm';

@Injectable()
export class CronService {
  @Cron(CronExpression.EVERY_5_SECONDS)
  addUser() {
    const user: DeepPartial<User> = {
      id: '1000000000000000000',
      username: 'superadmin',
      createdAt: new Date(),
    };
    void pubSub.publish(Topic.USER_ADDED, { [Topic.USER_ADDED]: user });
  }
}
