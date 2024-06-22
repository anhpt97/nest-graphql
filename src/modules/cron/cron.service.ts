import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeepPartial } from 'typeorm';
import { SubscriptionEvent } from '~/common/enums';
import { pubsub } from '~/common/graphql/utils';
import { User } from '~/entities';

@Injectable()
export class CronService {
  @Cron(CronExpression.EVERY_5_SECONDS)
  addUser() {
    const user: DeepPartial<User> = {
      id: '1',
      username: 'superadmin',
      createdAt: new Date(),
    };
    void pubsub.publish(SubscriptionEvent.UserAdded, {
      [SubscriptionEvent.UserAdded]: user,
    });
  }
}
