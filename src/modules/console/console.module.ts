import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { ConsoleModule as _ConsoleModule } from 'nestjs-console';
import ormconfig from '~/ormconfig';
import { ConsoleService } from './console.service';

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), _ConsoleModule],
  providers: [ConsoleService],
})
export class ConsoleModule {}
