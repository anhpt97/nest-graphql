import { EntityRepository, Repository } from 'typeorm';
import { Location } from '~/entities';

@EntityRepository(Location)
export class LocationRepository extends Repository<Location> {}
