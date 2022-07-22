import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  WithPrecisionColumnType,
  WithWidthColumnType,
} from 'typeorm/driver/types/ColumnTypes';

export const PrimaryKeyColumn = (options?: { name?: string }) =>
  PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: options?.name,
  });

export const ForeignKeyColumn = (options?: { name?: string }) =>
  Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
    name: options?.name,
  });

export const ColumnBlob = (options?: { name?: string }) =>
  Column({
    type: 'blob',
    nullable: true,
    name: options?.name,
  });

export const ColumnBoolean = (options?: { default?: boolean; name?: string }) =>
  Column({
    type: 'boolean',
    nullable: true,
    default: options?.default,
    name: options?.name,
  });

export const ColumnDate = (options?: { name?: string }) =>
  Column({
    type: 'date',
    nullable: true,
    name: options?.name,
  });

export const ColumnDateTime = (options?: { name?: string }) =>
  Column({
    type: 'datetime',
    nullable: true,
    name: options?.name,
  });

export const ColumnDecimal = (options?: {
  type?: WithPrecisionColumnType;
  default?: number;
  precision?: number;
  scale?: number;
  name?: string;
}) =>
  Column({
    type: options?.type || 'decimal',
    nullable: true,
    default: options?.default,
    precision: options?.precision,
    scale: options?.scale,
    name: options?.name,
  });

export const ColumnEnum = (options: {
  enum: any;
  default?: any;
  name?: string;
}) =>
  Column({
    type: 'enum',
    enum: options.enum,
    nullable: true,
    default: options.default,
    name: options.name,
  });

export const ColumnInteger = (options?: {
  type?: WithWidthColumnType;
  default?: number;
  name?: string;
}) =>
  Column({
    type: options?.type,
    nullable: true,
    default: options?.default,
    name: options?.name,
  });

export const ColumnJson = (options?: { name?: string }) =>
  Column({
    type: 'json',
    nullable: true,
    name: options?.name,
  });

export const ColumnSet = (options: {
  enum: any;
  default?: any[];
  name?: string;
}) =>
  Column({
    type: 'set',
    enum: options.enum,
    nullable: true,
    default: options.default,
    name: options.name,
  });

export const ColumnSimpleArray = (options?: { name?: string }) =>
  // string[]
  Column({
    type: 'simple-array',
    nullable: true,
    name: options?.name,
  });

export const ColumnSimpleEnum = (options: {
  enum: any;
  default?: any;
  name?: string;
}) =>
  Column({
    type: 'simple-enum',
    enum: options.enum,
    nullable: true,
    default: options.default,
    name: options.name,
  });

export const ColumnSimpleJson = (options?: { name?: string }) =>
  Column({
    type: 'simple-json',
    nullable: true,
    name: options?.name,
  });

export const ColumnText = (options?: { name?: string }) =>
  Column({
    type: 'text',
    nullable: true,
    name: options?.name,
  });

export const ColumnUuid = (options: { select?: boolean; name?: string }) =>
  Column({
    type: 'varchar',
    generated: 'uuid',
    length: 36,
    nullable: true,
    select: options.select,
    name: options.name,
  });

export const ColumnVarChar = (
  options: { length?: number; select?: boolean; name?: string } = {},
) =>
  Column({
    type: 'varchar',
    length: options.length,
    nullable: true,
    select: options.select,
    name: options.name,
  });

export const CreatedAt = (options: {
  type?: WithPrecisionColumnType;
  select?: boolean;
  name?: string;
}) =>
  CreateDateColumn({
    type: options.type || 'datetime',
    nullable: true,
    select: options.select || false,
    name: options.name,
  });

export const UpdatedAt = (options: {
  type?: WithPrecisionColumnType;
  select?: boolean;
  name?: string;
}) =>
  UpdateDateColumn({
    type: options.type || 'datetime',
    nullable: true,
    select: options.select || false,
    name: options.name,
  });

export const DeletedAt = (options: {
  type?: WithPrecisionColumnType;
  select?: boolean;
  name?: string;
}) =>
  DeleteDateColumn({
    type: options.type || 'datetime',
    nullable: true,
    select: options.select || false,
    name: options.name,
  });
