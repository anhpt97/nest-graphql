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
    const nodes: any[] = await getRepository(Entity).find();

    const edges = nodes.map((node) => ({
      cursor: node.id, // cursor: encodeToCursor(node.id),
      node: node,
    }));

    return {
      edges,
      nodes: nodes,
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
  const qb = getRepository(Entity).createQueryBuilder();
  const qb2 = qb.clone();

  if (first) {
    if (after) {
      qb.where('id > :after', {
        after, // after: decodeCursor(after),
      });
    }
    [nodes, totalCount] = await Promise.all([
      qb
        .take(first + 1)
        .orderBy('id', 'ASC')
        .getMany(),
      qb2.getCount(),
    ]);
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
    [nodes, totalCount] = await Promise.all([
      qb
        .take(last + 1)
        .orderBy('id', 'DESC')
        .getMany(),
      qb2.getCount(),
    ]);
    if (nodes.length > last) {
      hasPreviousPage = true;
      nodes.pop();
    }
    nodes.reverse();
  }

  const edges = nodes.map((node) => ({
    cursor: node.id, // cursor: encodeToCursor(node.id),
    node: node,
  }));

  return {
    edges,
    nodes: nodes,
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
    const nodes: any[] = await qb.getMany();

    const edges = nodes.map((node) => ({
      cursor: node.id, // cursor: encodeToCursor(node.id),
      node: node,
    }));

    return {
      edges,
      nodes: nodes,
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
      qb.andWhere(`${tablePath}.id > :after`, {
        after, // after: decodeCursor(after),
      });
    }
    [nodes, totalCount] = await Promise.all([
      qb
        .take(first + 1)
        .orderBy(`${tablePath}.id`, 'ASC')
        .getMany(),
      qb2.getCount(),
    ]);
    if (nodes.length > first) {
      hasNextPage = true;
      nodes.pop();
    }
  } else {
    if (before) {
      qb.andWhere(`${tablePath}.id < :before`, {
        before, // before: decodeCursor(before),
      });
    }
    [nodes, totalCount] = await Promise.all([
      qb
        .take(last + 1)
        .orderBy(`${tablePath}.id`, 'DESC')
        .getMany(),
      qb2.getCount(),
    ]);
    if (nodes.length > last) {
      hasPreviousPage = true;
      nodes.pop();
    }
    nodes.reverse();
  }

  const edges = nodes.map((node) => ({
    cursor: node.id, // cursor: encodeToCursor(node.id),
    node: node,
  }));

  return {
    edges,
    nodes: nodes,
    totalCount,
    pageInfo: {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasPreviousPage,
      hasNextPage,
    },
  };
};
