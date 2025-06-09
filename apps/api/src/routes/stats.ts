import { Hono } from 'hono';
import { getPlatformStats } from '../controllers/stats.controller';
import { createDb } from '../db';
import { logger } from '../utils/logger';

type Bindings = {
  DB: D1Database;
};

const stats = new Hono<{ Bindings: Bindings }>();

// GET /api/stats - Get platform statistics
stats.get('/', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const stats = await getPlatformStats(db);
    
    if (!stats.success) {
      return c.json({
        success: false,
        error: stats.error,
      }, 500);
    }

    return c.json({
      success: true,
      data: stats.data,
    });
  } catch (error) {
    logger.error('Error in stats route:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

export { stats as statsRoutes };
