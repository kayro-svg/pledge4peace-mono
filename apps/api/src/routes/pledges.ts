// import { Hono } from "hono";
// import { requireAuth } from "../middleware/auth";
// import { PledgesController } from "../controllers/pledges.controller";

// /* --------------------  Tipos de contexto  -------------------- */
// type Bindings = {
//   DB: D1Database;
//   JWT_SECRET: string;
// };

// type Variables = {
//   userId: string;
// };

// /* ---------------------  Instancias  -------------------------- */
// const pledgesRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();
// const controller = new PledgesController();

// /* -------------------------  Rutas  --------------------------- */
// pledgesRoutes.get("/campaign/:campaignId/count", (c) =>
//   controller.getCampaignPledgeCount(c)
// );

// pledgesRoutes.get("/check/:campaignId", requireAuth, (c) =>
//   controller.checkUserHasPledged(c)
// );

// pledgesRoutes.post("/", requireAuth, (c) => controller.createPledge(c));

// export { pledgesRoutes };

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { pledges, campaignPledgeCounts } from "../db/schema/pledges";
import { users } from "../db/schema/users";
import { and, eq, sql } from "drizzle-orm";
import { getJWTPayload, requireAuth } from "../middleware/auth";
import { MiddlewareHandler } from "hono";
import { logger } from "../utils/logger";
import { Context } from "hono";

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
  campaignTitle: string;
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
        and(eq(pledges.campaignId, campaignId), eq(pledges.status, "active"))
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
    logger.error("Error getting pledge count:", error);
    return c.json({ error: "Failed to get pledge count" }, 500);
  }
});

// Check if user has already pledged to a campaign
pledgesRoutes.get("/check/:campaignId", requireAuth, async (c) => {
  const { campaignId } = c.req.param();
  const db = drizzle(c.env.DB);
  const userId = c.get("userId");

  try {
    const existingPledge = await db
      .select()
      .from(pledges)
      .where(
        and(
          eq(pledges.campaignId, campaignId),
          eq(pledges.userId, userId),
          eq(pledges.status, "active")
        )
      )
      .limit(1)
      .then((rows) => rows[0]);

    return c.json({ hasPledged: !!existingPledge });
  } catch (error) {
    logger.error("Error checking pledge status:", error);
    return c.json({ error: "Failed to check pledge status" }, 500);
  }
});

// Create a new pledge - requires authentication
pledgesRoutes.post("/", requireAuth, async (c: Context) => {
  const body = (await c.req.json()) as Partial<CreatePledgeBody>;
  const db = drizzle(c.env.DB);

  // Validate required fields
  if (!body.campaignId || typeof body.campaignId !== "string") {
    return c.json({ error: "Valid campaign ID is required" }, 400);
  }

  if (body.agreeToTerms !== true) {
    return c.json({ error: "You must agree to the terms" }, 400);
  }

  // Get user ID from the middleware - this is guaranteed to exist because of the requireAuth middleware
  const userId = c.get("userId");

  try {
    // Check if user has already pledged to this campaign
    const existingPledge = await db
      .select()
      .from(pledges)
      .where(
        and(
          eq(pledges.campaignId, body.campaignId),
          eq(pledges.userId, userId),
          eq(pledges.status, "active")
        )
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (existingPledge) {
      // Return the existing pledge without creating a new one
      const countResult = await db
        .select({ count: campaignPledgeCounts.count })
        .from(campaignPledgeCounts)
        .where(eq(campaignPledgeCounts.campaignId, body.campaignId))
        .then((rows) => rows[0]);

      return c.json({
        success: true,
        pledge: existingPledge,
        pledgeCount: countResult?.count || 1,
        alreadyPledged: true,
      });
    }

    // Get user information for the notification
    const userInfo = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0]);

    // Create the pledge
    const newPledge = await db
      .insert(pledges)
      .values({
        id: crypto.randomUUID(),
        campaignId: body.campaignId,
        userId: userId,
        agreeToTerms: true,
        subscribeToUpdates: Boolean(body.subscribeToUpdates),
        createdAt: new Date(),
        status: "active",
      })
      .returning();

    // Update the pledge count using a single query with upsert
    await db
      .insert(campaignPledgeCounts)
      .values({
        campaignId: body.campaignId,
        count: 1,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: campaignPledgeCounts.campaignId,
        set: {
          count: sql`${campaignPledgeCounts.count} + 1`,
          lastUpdated: new Date(),
        },
      });

    // Get the updated count
    const countResult = await db
      .select({ count: campaignPledgeCounts.count })
      .from(campaignPledgeCounts)
      .where(eq(campaignPledgeCounts.campaignId, body.campaignId))
      .then((rows) => rows[0]);

    // Send notification email to admin if user information is available
    if (userInfo) {
      try {
        // Get auth service from context
        const authService = c.get("authService");

        if (authService) {
          await authService.emailService.sendPledgeNotification({
            userName: userInfo.name,
            userEmail: userInfo.email,
            campaignTitle: body.campaignTitle || "",
            pledgeDate: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            }),
            subscribeToUpdates: Boolean(body.subscribeToUpdates),
          });

          logger.log(
            "✅ Pledge notification sent to admin:",
            userInfo.email,
            "for campaign:",
            body.campaignId
          );
        }
      } catch (adminEmailError) {
        // No fallar el pledge si el email al admin falla
        logger.error(
          "⚠️ Failed to send pledge notification to admin:",
          adminEmailError
        );
      }
    }

    // 6. Agregar al Brevo - Campaigns List
    const brevoListsService = c.get("brevoListsService");
    if (brevoListsService && userInfo) {
      try {
        // Transform userInfo into a proper BrevoContact structure
        const brevoContact = {
          email: userInfo.email,
          attributes: {
            FIRSTNAME: userInfo.name || "",
          },
        };

        const brevoResponse = await brevoListsService.addToCampaignsList(
          brevoContact,
          body.campaignId,
          body.campaignTitle || ""
        );
        logger.log(
          "✅ Pledge notification sent to Brevo - Campaigns List:",
          brevoResponse
        );
      } catch (brevoError) {
        // No fallar el pledge si el Brevo falla
        logger.error("⚠️ Failed to add to Brevo campaigns list:", brevoError);
      }
    }

    return c.json(
      {
        success: true,
        pledge: newPledge[0],
        pledgeCount: countResult?.count || 1,
      },
      201
    );
  } catch (error) {
    logger.error("Error creating pledge:", error);
    return c.json(
      {
        error: "Failed to create pledge",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export { pledgesRoutes };
