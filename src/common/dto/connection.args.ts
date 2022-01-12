import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Max, Min } from 'class-validator';
import { ConnectionArguments, ConnectionCursor } from 'graphql-relay';

@ArgsType()
export class ConnectionArgs implements ConnectionArguments {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  @Max(100)
  first: number;

  @Field({ nullable: true })
  after: ConnectionCursor;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  @Max(100)
  last: number;

  @Field({ nullable: true })
  before: ConnectionCursor;
}
