import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Entity, Index } from 'typeorm';
import { generateId } from '~/common/graphql/utils';
import {
  ColumnDecimal,
  ColumnText,
  ColumnVarChar,
  CreatedAt,
  PrimaryKeyColumn,
  UpdatedAt,
} from '~/utils';

@ObjectType()
@Entity('location')
@Index('lat_lng', ['lat', 'lng'], { unique: true })
export class Location {
  @Field(() => ID)
  @PrimaryKeyColumn()
  id: string;

  @Field({ nullable: true })
  @ColumnVarChar()
  @Index('name', { unique: true })
  name: string;

  @Field({ nullable: true })
  @ColumnText()
  image: string;

  @Field({ nullable: true })
  @ColumnDecimal({ precision: 10, scale: 8 })
  lat: number;

  @Field({ nullable: true })
  @ColumnDecimal({ precision: 11, scale: 8 })
  lng: number;

  @CreatedAt({ name: 'created_at' })
  createdAt: Date;

  @UpdatedAt({ name: 'updated_at' })
  updatedAt: Date;

  // @Field()
  // @ForeignKeyColumn({ name: 'user_id' })
  // userId: string;

  // @Field(() => User, { nullable: true })
  // @ManyToOne(() => User, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'user_id' })
  // user: User;

  @BeforeInsert()
  setId() {
    this.id = generateId();
  }
}
