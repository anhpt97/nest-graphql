import { Location } from '@/entities';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Location)
export class LocationRepository extends Repository<Location> {}
