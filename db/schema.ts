import {
  mysqlTable,
  mysqlSchema,
  AnyMySqlColumn,
  index,
  foreignKey,
  primaryKey,
  int,
  varchar,
  text,
  datetime,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const todos = mysqlTable(
  'todos',
  {
    id: int('id').autoincrement().notNull(),
    userId: int('user_id').references(() => users.id),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content'),
    isCompleted: int('is_completed'),
    updateTime: datetime('update_time', { mode: 'string' }),
    createTime: datetime('create_time', { mode: 'string' }),
  },
  (table) => {
    return {
      fkUserId: index('fk_user_id').on(table.userId),
      todosIdPk: primaryKey({ columns: [table.id], name: 'todos_id_pk' }),
    };
  },
);

export const users = mysqlTable(
  'users',
  {
    id: int('id').autoincrement().notNull(),
    name: varchar('name', { length: 255 }),
    staffCode: varchar('staff_code', { length: 5 }),
    updateTime: datetime('update_time', { mode: 'string' }),
    createTime: datetime('create_time', { mode: 'string' }),
  },
  (table) => {
    return {
      usersIdPk: primaryKey({ columns: [table.id], name: 'users_id_pk' }),
    };
  },
);
