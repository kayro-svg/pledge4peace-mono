import { eq, count, sql } from "drizzle-orm";
import { users } from "../db/schema/users";
import { pledges } from "../db/schema/pledges";
import { Database } from "../db";
import { logger } from '../utils/logger';

export async function getPlatformStats(db: Database) {
  try {
    // Get total number of active users (peace activists)
    const userCount = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(users)
      .where(eq(users.status, 'active'));

    // Get total number of active pledges
    const pledgeCount = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(pledges)
      .where(eq(pledges.status, 'active'));

    return {
      success: true,
      data: {
        peaceActivists: userCount[0]?.count || 0,
        pledgesMade: pledgeCount[0]?.count || 0,
      },
    };
  } catch (error) {
    logger.error('Error fetching platform stats:', error);
    return {
      success: false,
      error: 'Failed to fetch platform statistics',
    };
  }
}
