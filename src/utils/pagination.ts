import { EntityTarget, getRepository, SelectQueryBuilder } from 'typeorm';
import { ConnectionArgs } from '~/common/dto';

export const paginate = <Entity>(items: Entity[] = [], total = 0) => ({
  items,
  total,
});

export const encodeToCursor = (data: string) =>
  Buffer.from(data).toString('base64');

export const decodeCursor = (cursor: string) =>
  Buffer.from(cursor, 'base64').toString();

export const relay = async <Entity>(
  args: ConnectionArgs,
  Entity: EntityTarget<Entity>,
) => {
  const { first, after, last, before } = args;

  if ((!first && !last) || (first && last)) {
    const [nodes, totalCount] = await getRepository(Entity).findAndCount();

    const edges = nodes.map((node: any) => ({
      cursor: node.id, // cursor: encodeToCursor(node.id),
      node,
    }));

    return {
      edges: nodes.map((node: any) => ({
        cursor: node.id, // cursor: encodeToCursor(node.id),
        node,
      })),
      nodes,
      totalCount,
      pageInfo: {
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  let [nodes, totalCount, hasPreviousPage, hasNextPage] = [[], 0, false, false];
  const qb = getRepository(Entity).createQueryBuilder();

  if (first) {
    if (after) {
      qb.where('id > :after', {
        after, // after: decodeCursor(after),
      });
    }
    [nodes, totalCount] = await qb
      .take(first + 1)
      .orderBy('id', 'ASC')
      .getManyAndCount();
    if (nodes.length > first) {
      hasNextPage = true;
      nodes.pop();
    }
  } else {
    if (before) {
      qb.where('id < :before', {
        before, // before: decodeCursor(before),
      });
    }
    [nodes, totalCount] = await qb
      .take(last + 1)
      .orderBy('id', 'DESC')
      .getManyAndCount();
    if (nodes.length > last) {
      hasPreviousPage = true;
      nodes.pop();
    }
    nodes.reverse();
  }

  const edges = nodes.map((node) => ({
    cursor: node.id, // cursor: encodeToCursor(node.id),
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

export const relay2 = async <Entity>(
  args: ConnectionArgs,
  qb: SelectQueryBuilder<Entity>,
) => {
  qb.skip().take().offset().limit().orderBy();

  const { first, after, last, before } = args;

  if ((!first && !last) || (first && last)) {
    const [nodes, totalCount] = await qb.getManyAndCount();

    const edges = nodes.map((node: any) => ({
      cursor: node.id, // cursor: encodeToCursor(node.id),
      node,
    }));

    return {
      edges,
      nodes,
      totalCount,
      pageInfo: {
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  let [nodes, totalCount, hasPreviousPage, hasNextPage] = [[], 0, false, false];

  const { tablePath } = qb.expressionMap.mainAlias;

  if (first) {
    if (after) {
      qb.andWhere(`${tablePath}_id > :after`, {
        after, // after: decodeCursor(after),
      });
    }
    [nodes, totalCount] = await qb
      .take(first + 1)
      .orderBy(`${tablePath}_id`, 'ASC')
      .getManyAndCount();
    if (nodes.length > first) {
      hasNextPage = true;
      nodes.pop();
    }
  } else {
    if (before) {
      qb.andWhere(`${tablePath}_id < :before`, {
        before, // before: decodeCursor(before),
      });
    }
    [nodes, totalCount] = await qb
      .take(last + 1)
      .orderBy(`${tablePath}_id`, 'DESC')
      .getManyAndCount();
    if (nodes.length > last) {
      hasPreviousPage = true;
      nodes.pop();
    }
    nodes.reverse();
  }

  const edges = nodes.map((node) => ({
    cursor: node.id, // cursor: encodeToCursor(node.id),
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
