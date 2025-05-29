import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { pledges, campaignPledgeCounts } from "../db/schema/pledges";
import { and, eq, sql } from "drizzle-orm";
import { getJWTPayload, requireAuth } from "../middleware/auth";
import { MiddlewareHandler } from "hono";

// Define environment type for Hono context
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

// Define variables that can be set in the context
type Variables = {
  userId: string;
};

interface CreatePledgeBody {
  campaignId: string;
  agreeToTerms: boolean;
  subscribeToUpdates: boolean;
}

const pledgesRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Routes defined above with proper type

// Get pledge count for a campaign
pledgesRoutes.get("/campaign/:campaignId/count", async (c) => {
  const { campaignId } = c.req.param();
  const db = drizzle(c.env.DB);

  try {
    // Try to get the count from the campaign_pledge_counts table
    const countRecord = await db
      .select()
      .from(campaignPledgeCounts)
      .where(eq(campaignPledgeCounts.campaignId, campaignId))
      .limit(1)
      .then((records) => records[0]);

    if (countRecord) {
      return c.json({ count: countRecord.count });
    }

    // If no record exists, count directly from pledges table
    const result = await db
      .select({ count: sql`count(*)` })
      .from(pledges)
      .where(
        and(
          eq(pledges.campaignId, campaignId),
          eq(pledges.status, "active")
        )
      )
      .then((rows) => rows[0]);

    const count = result[0]?.count || 0;

    // Create a record in the campaign_pledge_counts table for future use
    await db.insert(campaignPledgeCounts).values({
      campaignId,
      count,
      lastUpdated: new Date(),
    });

    return c.json({ count });
  } catch (error) {
    console.error("Error getting pledge count:", error);
    return c.json({ error: "Failed to get pledge count" }, 500);
  }
});

// Create a new pledge - requires authentication
pledgesRoutes.post("/", requireAuth, async (c) => {
  const body = await c.req.json() as Partial<CreatePledgeBody>;
  const db = drizzle(c.env.DB);

  // Validate required fields
  if (!body.campaignId || typeof body.campaignId !== 'string') {
    return c.json({ error: "Valid campaign ID is required" }, 400);
  }

  if (body.agreeToTerms !== true) {
    return c.json({ error: "You must agree to the terms" }, 400);
  }

  // Get user ID from the middleware - this is guaranteed to exist because of the requireAuth middleware
  const userId = c.get('userId');

  try {
    // Create the pledge
    const newPledge = await db.insert(pledges).values({
      id: crypto.randomUUID(),
      campaignId: body.campaignId,
      userId: userId, // Now required - user must be authenticated
      agreeToTerms: true,
      subscribeToUpdates: Boolean(body.subscribeToUpdates),
      createdAt: new Date(),
      status: "active"
    }).returning();

    // Update the pledge count using a single query with upsert
    await db
      .insert(campaignPledgeCounts)
      .values({
        campaignId: body.campaignId,
        count: 1,
        lastUpdated: new Date()
      })
      .onConflictDoUpdate({
        target: campaignPledgeCounts.campaignId,
        set: {
          count: sql`${campaignPledgeCounts.count} + 1`,
          lastUpdated: new Date()
        }
      });

    // Get the updated count
    const countResult = await db
      .select({ count: campaignPledgeCounts.count })
      .from(campaignPledgeCounts)
      .where(eq(campaignPledgeCounts.campaignId, body.campaignId))
      .then(rows => rows[0]);

    return c.json({
      success: true,
      pledge: newPledge[0],
      pledgeCount: countResult?.count || 1
    }, 201);
  } catch (error) {
    console.error("Error creating pledge:", error);
    return c.json({ 
      error: "Failed to create pledge",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { pledgesRoutes };
