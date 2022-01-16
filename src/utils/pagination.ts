import { ConnectionArgs } from '@/common/dto';
import { EntityTarget, getRepository, SelectQueryBuilder } from 'typeorm';

export const paginate = <Entity>(items: Entity[] = [], total = 0) => ({
  items,
  total,
});

export const relay = async <Entity>(
  args: ConnectionArgs,
  Entity: EntityTarget<Entity>,
) => {
  const { first, after, last, before } = args;

  if ((!first && !last) || (first && last)) {
    const nodes: any[] = await getRepository(Entity).find();

    const edges = nodes.map((node) => ({
      cursor: node.id, // cursor: Buffer.from(node.id).toString('base64'),
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

  let [nodes, hasPreviousPage, hasNextPage] = [[], false, false];
  const qb = getRepository(Entity).createQueryBuilder();
  const totalCount = await qb.clone().getCount();

  if (first) {
    if (after) {
      qb.where('id > :after', {
        after, // after: Buffer.from(after, 'base64').toString(),
      });
    }
    nodes = await qb
      .take(first + 1)
      .orderBy('id', 'ASC')
      .getMany();
    if (nodes.length > first) {
      hasNextPage = true;
      nodes.pop();
    }
  } else {
    if (before) {
      qb.where('id < :before', {
        before, // before: Buffer.from(before, 'base64').toString(),
      });
    }
    nodes = await qb
      .take(last + 1)
      .orderBy('id', 'DESC')
      .getMany();
    if (nodes.length > last) {
      hasPreviousPage = true;
      nodes.pop();
    }
    nodes.reverse();
  }

  const edges = nodes.map((node) => ({
    cursor: node.id, // cursor: Buffer.from(node.id).toString('base64'),
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
      cursor: node.id, // cursor: Buffer.from(node.id).toString('base64'),
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

  let [nodes, hasPreviousPage, hasNextPage] = [[], false, false];
  const totalCount = await qb.clone().getCount();

  const { tablePath } = qb.expressionMap.mainAlias;

  if (first) {
    if (after) {
      qb.andWhere(`${tablePath}_id > :after`, {
        after, // after: Buffer.from(after, 'base64').toString(),
      });
    }
    nodes = await qb
      .take(first + 1)
      .orderBy(`${tablePath}_id`, 'ASC')
      .getMany();
    if (nodes.length > first) {
      hasNextPage = true;
      nodes.pop();
    }
  } else {
    if (before) {
      qb.andWhere(`${tablePath}_id < :before`, {
        before, // before: Buffer.from(before, 'base64').toString(),
      });
    }
    nodes = await qb
      .take(last + 1)
      .orderBy(`${tablePath}_id`, 'DESC')
      .getMany();
    if (nodes.length > last) {
      hasPreviousPage = true;
      nodes.pop();
    }
    nodes.reverse();
  }

  const edges = nodes.map((node) => ({
    cursor: node.id, // cursor: Buffer.from(node.id).toString('base64'),
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
