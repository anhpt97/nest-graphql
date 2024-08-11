import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryError } from 'mysql2';
import { PaginatedDto } from '~/common/dto';
import { ErrorCode, Ix, MysqlError } from '~/common/enums';
import { relayPaginate } from '~/common/graphql/utils';
import { Location } from '~/entities';
import { LocationRepository } from '~/repositories';
import {
  LocationConnectionArgs,
  LocationInput,
  LocationPaginationArgs,
} from './location.dto';
import { LocationConnection, PaginatedLocation } from './location.model';

@Injectable()
export class LocationService {
  constructor(private locationRepository: LocationRepository) {}

  get(id: string): Promise<Location> {
    return this.locationRepository.findOne({ where: { id } });
  }

  async getList({
    keyword,
    limit,
    page,
  }: LocationPaginationArgs): Promise<PaginatedLocation> {
    const qb = this.locationRepository.createQueryBuilder('location');
    if (keyword) {
      qb.andWhere('location.name LIKE BINARY :keyword', {
        keyword: `%${keyword}%`,
      });
    }
    qb.orderBy('location.id', 'DESC')
      .take(limit)
      .skip(limit * (page - 1));
    const [items, total] = await qb.getManyAndCount();
    return new PaginatedDto(items, total);
  }

  getConnection({
    keyword,
    ...rest
  }: LocationConnectionArgs): Promise<LocationConnection> {
    const qb = this.locationRepository.createQueryBuilder('location');
    if (keyword) {
      qb.where('location.name LIKE :keyword', { keyword: `%${keyword}%` });
    }
    return relayPaginate(qb, rest);
  }

  async create(input: LocationInput) {
    try {
      await this.locationRepository.insert(
        this.locationRepository.create(input),
      );
      return true;
    } catch (error) {
      this.handleSqlError(error);
    }
  }

  async update(id: string, input: LocationInput) {
    try {
      const location = await this.locationRepository.findOne({ where: { id } });
      await this.locationRepository.update({ id }, { ...location, ...input });
      return true;
    } catch (error) {
      this.handleSqlError(error);
    }
  }

  async delete(id: string) {
    await this.locationRepository.findOne({ select: ['id'], where: { id } });
    void this.locationRepository.delete({ id });
    return true;
  }

  private handleSqlError(error: QueryError) {
    const { code, message } = error;
    if (code === MysqlError.ER_DUP_ENTRY) {
      if (message.includes(Ix.Name)) {
        throw new BadRequestException(ErrorCode.LOCATION_NAME_ALREADY_EXISTS);
      }
      if (message.includes(Ix.Lat_Lng)) {
        throw new BadRequestException(
          ErrorCode.LOCATION_COORDINATES_ALREADY_EXIST,
        );
      }
    }
    throw new InternalServerErrorException(error);
  }
}
