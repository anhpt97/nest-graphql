import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { ErrorCode } from '~/common/enums';
import { Location } from '~/entities';

@Injectable()
export class LocationRepository extends Repository<Location> {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {
    const { target, manager } = locationRepository;
    super(target, manager);
  }

  async findOne(options: FindOneOptions<Location>) {
    const location = await this.locationRepository.findOne(options);
    if (!location) {
      throw new NotFoundException(ErrorCode.LOCATION_NOT_FOUND);
    }
    return location;
  }
}
