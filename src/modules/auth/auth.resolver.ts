import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { Request } from 'express';
import { InputArgs } from '~/common/dto';
import { SubscriptionEvent } from '~/common/enums';
import { pubsub } from '~/common/graphql/utils';
import { AuthGuard } from '~/common/guards';
import { User } from '~/entities';
import { LoginInput } from './auth.dto';
import { LoginResponse } from './auth.model';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Subscription(() => User, {
    filter: ({ userAdded }, _, { req: { user } }: { req: Request }) =>
      userAdded.id === user.id,
    resolve: ({ userAdded }): User => ({ ...userAdded, updatedAt: new Date() }),
  })
  userAdded() {
    return pubsub.asyncIterator(SubscriptionEvent.UserAdded);
  }

  @Mutation(() => LoginResponse)
  login(@InputArgs() input: LoginInput): Promise<LoginResponse> {
    return this.authService.login(input);
  }
}
