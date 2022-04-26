import { Field, ObjectType } from '@nestjs/graphql';
import { Connection, Paginated } from '~/common/graphql/utils';
import { Location } from '~/entities';

@ObjectType()
export class Coordinates {
  @Field({ nullable: true })
  lat: number;

  @Field({ nullable: true })
  lng: number;
}

@ObjectType()
export class PaginatedLocation extends Paginated(Location) {}

@ObjectType()
export class LocationConnection extends Connection(Location) {}
