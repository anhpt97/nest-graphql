import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Entity, Index } from 'typeorm';
import { Idx } from '~/common/enums';
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
@Index(Idx.LAT_LNG, ['lat', 'lng'], { unique: true })
export class Location {
  @Field(() => ID)
  @PrimaryKeyColumn({ generated: false })
  id: string;

  @Field({ nullable: true })
  @ColumnVarChar()
  @Index(Idx.NAME, { unique: true })
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

  @Field({ nullable: true })
  @CreatedAt()
  createdAt: Date;

  @Field({ nullable: true })
  @UpdatedAt()
  updatedAt: Date;

  @BeforeInsert()
  beforeInsert() {
    this.id = generateId();
  }

  constructor(partial?: Partial<Location>) {
    Object.assign(this, partial);
  }
}
