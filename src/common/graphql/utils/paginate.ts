import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Connection as IConnection,
  PageInfo as IPageInfo,
} from 'graphql-relay';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { ConnectionArgs, PaginatedDto } from '~/common/dto';

export const Paginated = <T>(classRef: Type<T>) => {
  @ObjectType()
  class PaginatedType implements PaginatedDto<T> {
    @Field(() => [classRef])
    items: T[];

    @Field(() => Int)
    total: number;
  }
  return PaginatedType;
};

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

export const RelayPaginated = <T>(classRef: Type<T>) => {
  @ObjectType(`${classRef.name}Edge`)
  class EdgeType {
    @Field()
    cursor: string;

    @Field(() => classRef)
    node: T;
  }

  @ObjectType()
  class PaginatedType implements IConnection<T> {
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

export const encodeToBase64 = (data: string) =>
  Buffer.from(data).toString('base64');

export const decodeFromBase64 = (data: string) =>
  Buffer.from(data, 'base64').toString();

export const relayPaginate = async <Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  args: ConnectionArgs,
) => {
  qb.limit().offset().take().skip();

  const { before, after, first, last } = args;

  if ((!first && !last) || (first && last)) {
    const nodes = await qb.getMany();

    const edges = nodes.map((node) => ({
      cursor: node.id, // cursor: encodeToBase64(node.id),
      node,
    }));

    return {
      edges,
      nodes,
      totalCount: nodes.length,
      pageInfo: {
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  let [nodes, totalCount, hasPreviousPage, hasNextPage] = [[], 0, false, false];
  const qb2 = qb.clone();

  const { tablePath } = qb.expressionMap.mainAlias;

  if (first) {
    if (after) {
      qb.andWhere(`${tablePath}.id > :id`, {
        id: after, // id: decodeFromBase64(after),
      });
      hasPreviousPage = true;
    }
    [nodes, totalCount] = await Promise.all([
      qb
        .orderBy(`${tablePath}.id`, 'ASC')
        .take(first + 1)
        .getMany(),
      qb2.getCount(),
    ]);
    if (nodes.length > first) {
      hasNextPage = true;
      nodes.pop();
    }
  }

  if (last) {
    if (before) {
      qb.andWhere(`${tablePath}.id < :id`, {
        id: before, // id: decodeFromBase64(before),
      });
      hasNextPage = true;
    }
    [nodes, totalCount] = await Promise.all([
      qb
        .orderBy(`${tablePath}.id`, 'DESC')
        .take(last + 1)
        .getMany(),
      qb2.getCount(),
    ]);
    if (nodes.length > last) {
      hasPreviousPage = true;
      nodes.pop();
    }
  }

  const edges = nodes.map((node) => ({
    cursor: node.id, // cursor: encodeToBase64(node.id),
    node,
  }));

  return {
    edges,
    nodes,
    totalCount,
    pageInfo: {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasPreviousPage,
      hasNextPage,
    },
  };
};
