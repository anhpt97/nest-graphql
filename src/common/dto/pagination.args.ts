import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 10 })
  @Min(1)
  @Max(100)
  limit: number;

  @Field(() => Int, { defaultValue: 1 })
  @Min(1)
  page: number;
}
