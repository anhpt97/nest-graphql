import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ConnectionArgs } from '~/common/dto';
import { GqlAuthGuard } from '~/common/guards';
import { Location } from '~/entities';
import { LocationArgs, LocationInput } from './location.args';
import {
  Coordinates,
  LocationConnection,
  PaginatedLocation,
} from './location.model';
import { LocationService } from './location.service';

@UseGuards(GqlAuthGuard)
@Resolver(() => Location)
export class LocationResolver {
  constructor(private locationService: LocationService) {}

  @Query(() => Location)
  location(@Args('id') id: string): Promise<Location> {
    return this.locationService.getOne(id);
  }

  @ResolveField(() => Coordinates, { nullable: true })
  coordinates(@Parent() { lat, lng }: Location): Coordinates | null {
    return { lat, lng };
  }

  @Query(() => PaginatedLocation)
  locations(@Args() args: LocationArgs): Promise<PaginatedLocation> {
    return this.locationService.getMany(args);
  }

  @Query(() => LocationConnection)
  locationsConnection(
    @Args() args: ConnectionArgs,
  ): Promise<LocationConnection> {
    return this.locationService.getConnection(args);
  }

  @Mutation(() => Location)
  createLocation(@Args('input') input: LocationInput): Promise<Location> {
    return this.locationService.create(input);
  }

  @Mutation(() => Location)
  updateLocation(
    @Args('id') id: string,
    @Args('input') input: LocationInput,
  ): Promise<Location> {
    return this.locationService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteLocation(@Args('id') id: string): Promise<boolean> {
    return this.locationService.delete(id);
  }
}
