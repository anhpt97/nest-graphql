import { LocationRepository, UserRepository } from '@/repositories';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const repository = TypeOrmModule.forFeature([
  LocationRepository,
  UserRepository,
]);

@Global()
@Module({
  providers: repository.providers,
  exports: repository.exports,
})
export class RepositoryModule {}
