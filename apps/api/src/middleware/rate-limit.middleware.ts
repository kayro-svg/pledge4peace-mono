import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from '../utils/logger';

const WINDOW_SIZE = 60; // 1 minute window
const MAX_REQUESTS = 60; // 60 requests per minute

interface RateLimitInfo {
  count: number;
  timestamp: number;
}

export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const endpoint = new URL(c.req.url).pathname;
  const key = `ratelimit:${ip}:${endpoint}`;

  try {
    // Get current window data
    const currentData = await c.env.KV.get(key);
    const now = Date.now();
    let rateLimitInfo: RateLimitInfo;

    if (currentData) {
      rateLimitInfo = JSON.parse(currentData);

      // Check if we're in a new window
      if (now - rateLimitInfo.timestamp >= WINDOW_SIZE * 1000) {
        rateLimitInfo = {
          count: 1,
          timestamp: now,
        };
      } else {
        rateLimitInfo.count++;
      }
    } else {
      rateLimitInfo = {
        count: 1,
        timestamp: now,
      };
    }

    // Check if rate limit exceeded
    if (rateLimitInfo.count > MAX_REQUESTS) {
      throw new HTTPException(429, { message: "Too Many Requests" });
    }

    // Store updated rate limit info
    await c.env.KV.put(key, JSON.stringify(rateLimitInfo), {
      expirationTtl: WINDOW_SIZE,
    });

    // Add rate limit headers
    c.header("X-RateLimit-Limit", MAX_REQUESTS.toString());
    c.header(
      "X-RateLimit-Remaining",
      (MAX_REQUESTS - rateLimitInfo.count).toString()
    );
    c.header(
      "X-RateLimit-Reset",
      (rateLimitInfo.timestamp + WINDOW_SIZE * 1000).toString()
    );

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    logger.error("Rate limit error:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
};
