import { Module } from '@nestjs/common';
import { MeResolver } from './me.resolver';
import { MeService } from './me.service';

@Module({
  providers: [MeResolver, MeService],
})
export class MeModule {}
