import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUrl, Max, Min } from 'class-validator';
import { PaginationArgs } from '~/common/dto';

@ArgsType()
export class LocationArgs extends PaginationArgs {
  @Field({ nullable: true })
  name: string;
}

@InputType()
export class LocationInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
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
