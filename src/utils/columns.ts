import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WithWidthColumnType } from 'typeorm/driver/types/ColumnTypes';

export const PrimaryKeyColumn = () =>
  PrimaryColumn({
    type: 'bigint',
    unsigned: true,
  });

export const ForeignKeyColumn = () =>
  Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
  });

export const ColumnBlob = () =>
  Column({
    type: 'blob',
    nullable: true,
  });

export const ColumnBoolean = (options: { default?: boolean }) =>
  Column({
    type: 'boolean',
    nullable: true,
    default: options.default,
  });

export const ColumnDate = () =>
  Column({
    type: 'date',
    nullable: true,
  });

export const ColumnDateTime = () =>
  Column({
    type: 'datetime',
    nullable: true,
    // precision: 0, // for MariaDB
  });

export const ColumnDecimal = (
  options: { precision?: number; scale?: number } = {
    precision: 255,
    scale: 2,
  },
) =>
  Column({
    type: 'double',
    nullable: true,
    precision: options.precision, // max: 255
    scale: options.scale, // max: 30
  });

export const ColumnEnum = (options: { enum: any; default?: any }) =>
  Column({
    type: 'enum',
    enum: options.enum,
    nullable: true,
    default: options.default,
  });

export const ColumnInteger = (options: {
  type?: WithWidthColumnType;
  default?: number;
}) =>
  Column({
    type: options.type,
    nullable: true,
    default: options.default,
  });

export const ColumnJson = () =>
  Column({
    type: 'json',
    nullable: true,
  });

export const ColumnSet = (options: { enum: any; default?: any[] }) =>
  Column({
    type: 'set',
    enum: options.enum,
    nullable: true,
    default: options.default,
  });

export const ColumnSimpleArray = () =>
  // unknown[];
  Column({
    type: 'simple-array',
    nullable: true,
  });

export const ColumnSimpleEnum = (options: { enum: any; default?: any }) =>
  Column({
    type: 'simple-enum',
    enum: options.enum,
    nullable: true,
    default: options.default,
  });

export const ColumnSimpleJson = () =>
  Column({
    type: 'simple-json',
    nullable: true,
  });

export const ColumnText = () =>
  Column({
    type: 'text',
    nullable: true,
  });

export const ColumnUuid = (options: { select?: boolean } = { select: true }) =>
  Column({
    type: 'varchar',
    generated: 'uuid',
    length: 36,
    nullable: true,
    select: options.select,
  });

export const ColumnVarChar = (
  options: { length?: number; select?: boolean } = {
    length: 255,
    select: true,
  },
) =>
  Column({
    type: 'varchar',
    length: options.length,
    nullable: true,
    select: options.select,
  });

export const CreatedAt = (options: { select?: boolean } = { select: false }) =>
  CreateDateColumn({
    type: 'datetime',
    nullable: true,
    // precision: 0, // for MariaDB
    select: options.select,
  });

export const UpdatedAt = (options: { select?: boolean } = { select: false }) =>
  UpdateDateColumn({
    type: 'datetime',
    nullable: true,
    // precision: 0, // for MariaDB
    select: options.select,
  });

export const DeletedAt = () =>
  DeleteDateColumn({
    type: 'datetime',
    nullable: true,
    // precision: 0, // for MariaDB
  });
