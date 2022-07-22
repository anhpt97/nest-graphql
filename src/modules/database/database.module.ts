import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from '~/entities';

const entityModule = TypeOrmModule.forFeature(Object.values(entities));

@Global()
@Module({
  imports: [entityModule],
  exports: [entityModule],
})
export class DatabaseModule {}
