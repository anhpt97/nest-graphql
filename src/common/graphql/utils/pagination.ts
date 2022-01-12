import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import {
  Connection as IConnection,
  PageInfo as IPageInfo,
} from 'graphql-relay';

export const Paginated = <T>(classRef: Type<T>): any => {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [classRef])
    items: T[];

    @Field(() => Int)
    total: number;
  }
  return PaginatedType;
};

export const Connection = <T>(classRef: Type<T>): any => {
  @ObjectType()
  class PageInfo implements IPageInfo {
    @Field({ nullable: true })
    startCursor: string;

    @Field({ nullable: true })
    endCursor: string;

    @Field()
    hasPreviousPage: boolean;

    @Field()
    hasNextPage: boolean;
  }

  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field()
    cursor: string;

    @Field(() => classRef)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IConnection<T> {
    @Field(() => [EdgeType], { nullable: true })
    edges: EdgeType[];

    @Field(() => [classRef], { nullable: true })
    nodes: T[];

    @Field(() => Int)
    totalCount: number;

    @Field()
    pageInfo: PageInfo;
  }
  return PaginatedType;
};
