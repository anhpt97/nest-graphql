import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationRepository, UserRepository } from '~/repositories';

const database = TypeOrmModule.forFeature([LocationRepository, UserRepository]);

@Global()
@Module({
  providers: database.providers,
  exports: database.exports,
})
export class DatabaseModule {}
