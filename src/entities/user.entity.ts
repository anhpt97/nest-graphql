import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BeforeInsert, Entity, Index } from 'typeorm';
import { UserRole, UserStatus } from '~/common/enums';
import { generateId } from '~/common/graphql/utils';
import {
  ColumnEnum,
  ColumnVarChar,
  CreatedAt,
  PrimaryKeyColumn,
  UpdatedAt,
} from '~/utils';

@ObjectType()
@Entity('user')
export class User {
  @Field(() => ID)
  @PrimaryKeyColumn()
  id: string;

  @Field({ nullable: true })
  @ColumnVarChar({
    length: 32,
  })
  @Index('username', { unique: true })
  @ApiProperty({ example: 'superadmin' })
  username: string;

  @Field({ nullable: true })
  @ColumnVarChar()
  @Index('email', { unique: true })
  @ApiPropertyOptional({ example: null })
  email: string;

  @ColumnVarChar({
    length: 64,
    select: false,
    name: 'hashed_password',
  })
  hashedPassword: string;

  @Field({ nullable: true })
  @ColumnEnum({
    enum: UserRole,
  })
  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  role: UserRole;

  @Field({ nullable: true })
  @ColumnEnum({
    enum: UserStatus,
  })
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreatedAt({ name: 'created_at' })
  createdAt: Date;

  @UpdatedAt({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  setId() {
    this.id = generateId();
  }
}
