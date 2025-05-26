import { Database } from "./db";
import { HTTPExceptionOptions } from "hono/http-exception";

declare module "hono/http-exception" {
  interface HTTPExceptionOptions {
    errors?: Array<{ message: string; path: string[] }>;
  }
}

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  KV: KVNamespace;
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
}

type Bindings = Env;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface JWTPayload {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  exp: number;
}

type DbClient = Database;
