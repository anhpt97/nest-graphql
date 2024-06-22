import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Roles } from '~/common/decorators';
import { IdArgs, InputArgs } from '~/common/dto';
import { UserRole } from '~/common/enums';
import { AuthGuard } from '~/common/guards';
import { Location } from '~/entities';
import {
  LocationConnectionArgs,
  LocationInput,
  LocationPaginationArgs,
} from './location.dto';
import {
  Coordinates,
  LocationConnection,
  PaginatedLocation,
} from './location.model';
import { LocationService } from './location.service';

@UseGuards(AuthGuard)
@Resolver(() => Location)
export class LocationResolver {
  constructor(private locationService: LocationService) {}

  @Query(() => Location)
  location(@IdArgs() id: string): Promise<Location> {
    return this.locationService.get(id);
  }

  @ResolveField(() => Coordinates, { nullable: true })
  coordinates(@Parent() { lat, lng }: Location): Coordinates {
    return { lat, lng };
  }

  @Query(() => PaginatedLocation)
  locations(@Args() args: LocationPaginationArgs): Promise<PaginatedLocation> {
    return this.locationService.getList(args);
  }

  @Query(() => LocationConnection)
  locationsConnection(
    @Args() args: LocationConnectionArgs,
  ): Promise<LocationConnection> {
    return this.locationService.getConnection(args);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  createLocation(@InputArgs() input: LocationInput): Promise<boolean> {
    return this.locationService.create(input);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  updateLocation(
    @IdArgs() id: string,
    @InputArgs() input: LocationInput,
  ): Promise<boolean> {
    return this.locationService.update(id, input);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  deleteLocation(@IdArgs() id: string): Promise<boolean> {
    return this.locationService.delete(id);
  }
}
