import { Trim } from '@/utils';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginBody {
  @IsString()
  @IsNotEmpty()
  @Trim()
  @ApiProperty({ example: 'superadmin' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123456' })
  password: string;
}

export class RefreshTokenBody {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  refreshToken: string;
}

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
