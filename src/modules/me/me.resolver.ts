import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '~/common/decorators';
import { AuthGuard } from '~/common/guards';
import { JwtPayload } from '~/common/models';
import { User } from '~/entities';
import { MeService } from './me.service';

@UseGuards(AuthGuard)
@Resolver()
export class MeResolver {
  constructor(private meService: MeService) {}

  @Query(() => User)
  whoAmI(@CurrentUser() currentUser: JwtPayload): Promise<User> {
    return this.meService.whoAmI(currentUser);
  }
}
