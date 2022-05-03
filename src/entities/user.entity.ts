import { Field, ID, ObjectType } from '@nestjs/graphql';
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
  username: string;

  @Field({ nullable: true })
  @ColumnVarChar()
  @Index('email', { unique: true })
  email: string;

  @ColumnVarChar({
    length: 64,
    select: false,
    name: 'password_hash',
  })
  passwordHash: string;

  @Field({ nullable: true })
  @ColumnEnum({
    enum: UserRole,
  })
  role: UserRole;

  @Field({ nullable: true })
  @ColumnEnum({
    enum: UserStatus,
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
