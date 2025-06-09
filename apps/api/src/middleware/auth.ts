import { Context, MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import { logger } from '../utils/logger';

// Define the type for the environment bindings
type Bindings = {
  JWT_SECRET: string;
  DB: D1Database;
};

// Define the interface for the Hono environment
declare module "hono" {
  interface ContextVariableMap {
    userId: string;
  }
}

/**
 * Extracts and returns the JWT payload from the Authorization header
 * Does not throw an error if no token is present or if token is invalid
 */
export function getJWTPayload(c: Context<{ Bindings: Bindings }>) {
  try {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    
    const token = authHeader.split(" ")[1];
    return verify(token, c.env.JWT_SECRET);
  } catch (error) {
    logger.error("Error extracting JWT payload:", error);
    return null;
  }
}

/**
 * Middleware that requires authentication
 * Will return a 401 error if the user is not authenticated
 */
export const requireAuth: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Authentication required" }, 401);
    }
    
    const token = authHeader.split(" ")[1];
    const payload = await verify(token, c.env.JWT_SECRET);
    
    if (!payload || typeof payload !== 'object' || !payload.sub) {
      return c.json({ error: "Invalid authentication token" }, 401);
    }
    
    // Add the user ID to the request for easy access
    c.set('userId', String(payload.sub));
    
    await next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return c.json({ error: "Authentication failed" }, 401);
  }
}
