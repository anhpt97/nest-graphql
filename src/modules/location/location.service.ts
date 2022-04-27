import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryError } from 'mysql2';
import { ConnectionArgs } from '~/common/dto';
import { ErrorMessage } from '~/common/enums';
import { Location } from '~/entities';
import { LocationRepository } from '~/repositories';
import { paginate } from '~/utils';
import { LocationArgs, LocationInput } from './location.dto';
import { LocationConnection, PaginatedLocation } from './location.model';

@Injectable()
export class LocationService {
  constructor(private readonly locationRepository: LocationRepository) {}

  async getOne(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({ id });
    if (!location) {
      throw new NotFoundException(ErrorMessage.LOCATION_NOT_FOUND);
    }
    return location;
  }

  async getMany(args: LocationArgs): Promise<PaginatedLocation> {
    const { name, limit, page } = args;
    const qb = this.locationRepository.createQueryBuilder('location');
    if (name) {
      qb.andWhere('location.name LIKE BINARY :name', { name: `%${name}%` });
    }
    qb.skip(limit * (page - 1))
      .take(limit)
      .orderBy('location.id', 'DESC');
    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total);
  }

  async getConnection(args: ConnectionArgs): Promise<LocationConnection> {
    // return relay(args, Location);

    // return relay2(
    //   args,
    //   this.locationRepository
    //     .createQueryBuilder('location')
    //     .innerJoinAndSelect('location.user', 'user')
    //     .where('location.name LIKE :name', {
    //       name: `%${args.name}%`,
    //     }),
    // );

    const { first, after, last, before } = args;

    if ((!first && !last) || (first && last)) {
      const locations = await this.locationRepository.find();

      const edges = locations.map((location) => ({
        cursor: location.id, // cursor: encodeToCursor(node.id),
        node: location,
      }));

      return {
        edges,
        nodes: locations,
        totalCount: locations.length,
        pageInfo: {
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    }

    let [locations, totalCount, hasPreviousPage, hasNextPage] = [
      [],
      0,
      false,
      false,
    ];
    const qb = this.locationRepository.createQueryBuilder('location');
    const qb2 = qb.clone();

    if (first) {
      if (after) {
        qb.where('location.id > :after', {
          after, // after: decodeCursor(after),
        });
        hasPreviousPage = true;
      }
      [locations, totalCount] = await Promise.all([
        qb
          .take(first + 1)
          .orderBy('location.id', 'ASC')
          .getMany(),
        qb2.getCount(),
      ]);
      if (locations.length > first) {
        hasNextPage = true;
        locations.pop();
      }
    }

    if (last) {
      if (before) {
        qb.where('location.id < :before', {
          before, // before: decodeCursor(before),
        });
        hasNextPage = true;
      }
      [locations, totalCount] = await Promise.all([
        qb
          .take(last + 1)
          .orderBy('location.id', 'DESC')
          .getMany(),
        qb2.getCount(),
      ]);
      if (locations.length > last) {
        hasPreviousPage = true;
        locations.pop();
      }
      locations.reverse();
    }

    const edges = locations.map((location) => ({
      cursor: location.id, // cursor: encodeToCursor(node.id),
      node: location,
    }));

    return {
      edges,
      nodes: locations,
      totalCount,
      pageInfo: {
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
        hasPreviousPage,
        hasNextPage,
      },
    };
  }

  async create(input: LocationInput): Promise<Location> {
    try {
      const location = this.locationRepository.create(input);
      return await this.locationRepository.save(location);
    } catch (error) {
      this.throwError(error);
    }
  }

  async update(id: string, input: LocationInput): Promise<Location> {
    try {
      const location = await this.locationRepository.findOne({ id });
      if (!location) {
        throw new NotFoundException(ErrorMessage.LOCATION_NOT_FOUND);
      }
      return await this.locationRepository.save({ ...location, ...input });
    } catch (error) {
      this.throwError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    const location = await this.locationRepository.findOne({ id });
    if (!location) {
      throw new NotFoundException(ErrorMessage.LOCATION_NOT_FOUND);
    }
    await this.locationRepository.delete({ id });
    return true;
  }

  private throwError(error: QueryError) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('name')) {
        throw new BadRequestException(
          ErrorMessage.LOCATION_NAME_ALREADY_EXISTS,
        );
      }
      if (error.message.includes('lat_lng')) {
        throw new BadRequestException(
          ErrorMessage.LOCATION_COORDINATES_ALREADY_EXIST,
        );
      }
    }
    throw new BadRequestException(error);
  }
}
