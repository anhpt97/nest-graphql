import { Topic } from '@/common/enums';
import { pubSub } from '@/common/graphql/utils';
import { GqlAuthGuard } from '@/common/guards';
import { User } from '@/entities';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { LoginInput } from './auth.dto';
import { Tokens } from './auth.model';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GqlAuthGuard)
  @Subscription(() => User, {
    filter: ({ userAdded }, _, { user }) => userAdded.id === user.id,
    resolve: ({ userAdded }): User => ({ ...userAdded, email: 'Huấn Rose' }),
  })
  userAdded() {
    return pubSub.asyncIterator(Topic.USER_ADDED);
  }

  @Mutation(() => Tokens)
  login(@Args('input') input: LoginInput) {
    const { username, password } = input;
    return this.authService.login(username, password);
  }
}
