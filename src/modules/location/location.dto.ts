import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsUrl, Max, Min } from 'class-validator';
import { ConnectionArgs, PaginationArgs } from '~/common/dto';

@ArgsType()
export class LocationPaginationArgs extends PaginationArgs {
  @Field({ nullable: true })
  keyword: string;
}

@ArgsType()
export class LocationConnectionArgs extends ConnectionArgs {
  @Field({ nullable: true })
  keyword: string;
}

@InputType()
export class LocationInput {
  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  image: string;

  @Field({ nullable: true })
  @IsOptional()
  @Min(-90)
  @Max(90)
  lat: number;

  @Field({ nullable: true })
  @IsOptional()
  @Min(-180)
  @Max(180)
  lng: number;
}
