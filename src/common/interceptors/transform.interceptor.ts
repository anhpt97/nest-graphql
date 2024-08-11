import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { instanceToPlain } from 'class-transformer';
import { map } from 'rxjs';
import { Response } from '../models';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    return ctx.getType<GqlContextType>() === 'graphql'
      ? next.handle()
      : next.handle().pipe(
          map<any, Response>((data) => {
            try {
              return data === undefined
                ? { data: true }
                : instanceToPlain({ data });
            } catch {
              return data;
            }
          }),
        );
  }
}
