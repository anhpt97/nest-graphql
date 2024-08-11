import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Entity, Index } from 'typeorm';
import { Ix, UserRole, UserStatus } from '~/common/enums';
import { generateId } from '~/common/graphql/utils';
import { ColumnVarchar, CreatedAt, PrimaryKeyColumn, UpdatedAt } from '~/utils';

@ObjectType()
@Entity('user')
export class User {
  @Field(() => ID)
  @PrimaryKeyColumn()
  id: string;

  @Field({ nullable: true })
  @ColumnVarchar()
  @Index(Ix.Username, { unique: true })
  username: string;

  @Field({ nullable: true })
  @ColumnVarchar()
  @Index(Ix.Email, { unique: true })
  email: string;

  @ColumnVarchar({
    name: 'hashed_password',
    select: false,
  })
  hashedPassword: string;

  @Field({ nullable: true })
  @ColumnVarchar()
  role: UserRole;

  @Field({ nullable: true })
  @ColumnVarchar()
  status: UserStatus;

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

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }

  /* Relationship:
    – One-to-one:
    (src/entities/user.entity.ts)
    @Field({ nullable: true })
    @ForeignKeyColumn({ name: 'profile_id' })
    profileId: number;

    @Field(() => Profile, { nullable: true })
    @OneToOne(() => Profile, { onDelete: 'CASCADE' })
    @JoinColumn({
      name: 'profile_id',
      foreignKeyConstraintName: 'FK_user_profile', // ForeignKey.User_Profile
    })
    profile: Profile;

    (src/entities/profile.entity.ts)
    @Field(() => User, { nullable: true })
    @OneToOne(() => User)
    user: User;

    – One-to-many:
    (src/entities/company.entity.ts)
    @Field(() => [User], { nullable: true })
    @OneToMany(() => User, (user) => user.company)
    users: User[];

    – Many-to-one:
    (src/entities/user.entity.ts)
    @Field({ nullable: true })
    @ForeignKeyColumn({ name: 'company_id' })
    companyId: number;

    @Field(() => Company, { nullable: true })
    @ManyToOne(() => Company, { onDelete: 'CASCADE' })
    @JoinColumn({
      name: 'company_id',
      foreignKeyConstraintName: 'FK_user_company', // ForeignKey.User_Company
    })
    company: Company;

    – Many-to-many:
    (src/entities/category.entity.ts)
    @Field(() => [CategoryProduct], { nullable: true })
    @OneToMany(
      () => CategoryProduct,
      (categoryProduct) => categoryProduct.category,
    )
    categoryProducts: CategoryProduct[];

    (src/entities/product.entity.ts)
    @Field(() => [CategoryProduct], { nullable: true })
    @OneToMany(
      () => CategoryProduct,
      (categoryProduct) => categoryProduct.product,
    )
    categoryProducts: CategoryProduct[];

    (src/entities/category_product.entity.ts)
    @Field({ nullable: true })
    @PrimaryKeyColumn({ name: 'category_id' })
    categoryId: number;

    @Field({ nullable: true })
    @PrimaryKeyColumn({ name: 'product_id' })
    productId: number;

    @Field(() => Category, { nullable: true })
    @ManyToOne(() => Category, { onDelete: 'CASCADE' })
    @JoinColumn({
      name: 'category_id',
      foreignKeyConstraintName: 'FK_categoryProduct_category', // ForeignKey.CategoryProduct_Category
    })
    category: Category;

    @Field(() => Product, { nullable: true })
    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    @JoinColumn({
      name: 'product_id',
      foreignKeyConstraintName: 'FK_categoryProduct_product', // ForeignKey.CategoryProduct_Product
    })
    product: Product;
  */
}
