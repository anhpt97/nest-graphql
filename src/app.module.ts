import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import gqlconfig from './gqlconfig';
import { AuthModule } from './modules/auth/auth.module';
import { CronModule } from './modules/cron/cron.module';
import { LocationModule } from './modules/location/location.module';
import { MeModule } from './modules/me/me.module';
import { RedisModule } from './modules/redis/redis.module';
import { RepositoryModule } from './modules/repository/repository.module';
import ormconfig from './ormconfig';

@Module({
  imports: [
    GraphQLModule.forRoot(gqlconfig),
    TypeOrmModule.forRoot(ormconfig),
    AuthModule,
    CronModule,
    LocationModule,
    MeModule,
    RedisModule,
    RepositoryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
