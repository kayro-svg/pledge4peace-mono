import { Database } from "./db";
import { HTTPExceptionOptions } from "hono/http-exception";
import { AuthService } from "./services/auth.service";
import { BrevoListsService } from "./services/brevo-lists.service";

declare module "hono/http-exception" {
  interface HTTPExceptionOptions {
    errors?: Array<{ message: string; path: string[] }>;
  }
}

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  KV: KVNamespace;
  FROM_EMAIL: string;
}

type Bindings = Env;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
}

interface JWTPayload {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  exp: number;
}

type DbClient = Database;

declare module "hono" {
  interface ContextVariableMap {
    authService: AuthService;
    brevoListsService: BrevoListsService;
  }
}
