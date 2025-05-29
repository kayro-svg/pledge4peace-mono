/// <reference types="@cloudflare/workers-types" />
import type { DatabaseSchema } from '../db/schema/types';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    db: ReturnType<typeof import('drizzle-orm/d1').drizzle<DatabaseSchema>>;
  }
}
