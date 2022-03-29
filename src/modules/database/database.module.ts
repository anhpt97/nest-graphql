import { LocationRepository, UserRepository } from '@/repositories';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const database = TypeOrmModule.forFeature([LocationRepository, UserRepository]);

@Global()
@Module({
  providers: database.providers,
  exports: database.exports,
})
export class DatabaseModule {}
