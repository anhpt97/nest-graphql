import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUrl, Max, Min } from 'class-validator';
import { PaginationArgs } from '~/common/dto';
import { Trim } from '~/utils';

@ArgsType()
export class LocationArgs extends PaginationArgs {
  @Field({ nullable: true })
  name: string;
}

@InputType()
export class LocationInput {
  @Field()
  @IsNotEmpty()
  @Trim()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  @Trim()
  image: string;

  @Field()
  @Min(-90)
  @Max(90)
  lat: number;

  @Field()
  @Min(-180)
  @Max(180)
  lng: number;
}
