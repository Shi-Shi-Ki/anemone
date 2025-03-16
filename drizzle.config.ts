import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  schema: './db/schema.ts',
  out: './db',
  dialect: 'mysql',
  dbCredentials: {
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.MYSQL_DATABASE,
  },
} satisfies Config;
