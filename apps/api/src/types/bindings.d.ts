/// <reference types="@cloudflare/workers-types" />
import type { DatabaseSchema } from "../db/schema/types";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  BUCKET: R2Bucket;
  NODE_ENV: string;
  BREVO_API_KEY: string;
  FROM_EMAIL: string;
  FROM_NAME?: string;
  FRONTEND_URL: string;
  BUCKET_DOMAIN?: string;
  P4P_BACKEND_API_TOKEN: string;
  NOTIFICATIONS_BOT_TOKEN: string;
  WEBHOOK_AUTH_TOKEN: string;
  LINKEDIN_CLIENT_ID: string;
  LINKEDIN_CLIENT_SECRET: string;
}

declare module "hono" {
  interface ContextVariableMap {
    db: ReturnType<typeof import("drizzle-orm/d1").drizzle<DatabaseSchema>>;
  }
}
