import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { Trim } from '~/utils';

@InputType()
export class LoginInput {
  @Field()
  @IsNotEmpty()
  @Trim()
  username: string;

  @Field()
  @IsNotEmpty()
  password: string;
}
