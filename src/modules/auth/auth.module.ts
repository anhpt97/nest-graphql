import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JWT_EXP_TIME, JWT_SECRET_KEY } from '~/common/constants';
import { RedisModule } from '../redis/redis.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: JWT_EXP_TIME },
      secret: JWT_SECRET_KEY,
    }),
    RedisModule,
  ],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
