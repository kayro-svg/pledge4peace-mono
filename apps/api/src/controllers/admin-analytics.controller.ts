import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { getAuthUser } from "../middleware/auth.middleware";
import { and, desc, eq, gte, gt, inArray, like, or } from "drizzle-orm";
import { solutions } from "../db/schema/solutions";
import { solutionInteractions } from "../db/schema/interactions";
import { comments } from "../db/schema/comments";
import { pledges } from "../db/schema/pledges";
import { logger } from "../utils/logger";
import { users } from "../db/schema/users";

type PrivilegedRole = "moderator" | "admin" | "superAdmin";

function ensurePrivileged(c: Context): void {
  const user = getAuthUser(c);
  const role = user.role as PrivilegedRole | "user";
  const allowed: PrivilegedRole[] = ["moderator", "admin", "superAdmin"];
  if (!allowed.includes(role as PrivilegedRole)) {
    throw new HTTPException(403, { message: "Insufficient permissions" });
  }
}

export class AdminAnalyticsController {
  /**
   * GET /api/admin-analytics/global/summary
   * Aggregated metrics across all campaigns
   */
  async getGlobalSummary(c: Context) {
    try {
      ensurePrivileged(c);
      const db = createDb(c.env.DB);

      // all published solutions
      const solRows = await db
        .select({ id: solutions.id })
        .from(solutions)
        .where(eq(solutions.status, "published"));
      const solutionIds = solRows.map((s) => s.id);

      let likes = 0,
        dislikes = 0,
        shares = 0,
        commentsCount = 0;
      if (solutionIds.length > 0) {
        const interactions = await db.query.solutionInteractions.findMany({
          where: and(
            inArray(solutionInteractions.solutionId, solutionIds),
            eq(solutionInteractions.status, "active")
          ),
        });
        for (const it of interactions) {
          if (it.type === "like") likes++;
          else if (it.type === "dislike") dislikes++;
          else if (it.type === "share") shares++;
        }
        const activeComments = await db.query.comments.findMany({
          where: and(
            inArray(comments.solutionId, solutionIds),
            eq(comments.status, "active")
          ),
        });
        commentsCount = activeComments.length;
      }

      // all active pledges
      const pledgeRows = await db
        .select({ id: pledges.id })
        .from(pledges)
        .where(eq(pledges.status, "active"));

      return c.json({
        success: true,
        data: {
          solutionsPublished: solRows.length,
          interactions: { likes, dislikes, shares },
          comments: commentsCount,
          pledges: pledgeRows.length,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error getting global summary:", error);
      throw new HTTPException(500, { message: "Error getting global summary" });
    }
  }

  /**
   * GET /api/admin-analytics/global/timeseries?days=30
   * Global daily time series for likes, dislikes, shares, comments, pledges
   */
  async getGlobalTimeSeries(c: Context) {
    try {
      ensurePrivileged(c);
      const days = Math.max(
        1,
        Math.min(365, parseInt(c.req.query("days") || "30"))
      );
      const db = createDb(c.env.DB);

      const start = new Date();
      start.setDate(start.getDate() - days + 1);
      start.setHours(0, 0, 0, 0);

      // buckets by day
      const buckets: Record<
        string,
        {
          likes: number;
          dislikes: number;
          shares: number;
          comments: number;
          pledges: number;
        }
      > = {};
      const iter = new Date(start);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      while (iter <= today) {
        const key = iter.toISOString().split("T")[0];
        buckets[key] = {
          likes: 0,
          dislikes: 0,
          shares: 0,
          comments: 0,
          pledges: 0,
        };
        iter.setDate(iter.getDate() + 1);
      }

      // interactions/comments since start (global)
      const interactions = await db.query.solutionInteractions.findMany({
        where: and(
          eq(solutionInteractions.status, "active"),
          gte(solutionInteractions.createdAt, start)
        ),
      });
      for (const it of interactions) {
        const key = new Date(it.createdAt).toISOString().split("T")[0];
        const b = buckets[key];
        if (!b) continue;
        if (it.type === "like") b.likes++;
        else if (it.type === "dislike") b.dislikes++;
        else if (it.type === "share") b.shares++;
      }
      const activeComments = await db.query.comments.findMany({
        where: and(
          eq(comments.status, "active"),
          gte(comments.createdAt, start)
        ),
      });
      for (const cm of activeComments) {
        const key = new Date(cm.createdAt).toISOString().split("T")[0];
        if (buckets[key]) buckets[key].comments++;
      }

      // pledges since start (global)
      const pledgesSince = await db
        .select({ id: pledges.id, createdAt: pledges.createdAt })
        .from(pledges)
        .where(
          and(eq(pledges.status, "active"), gte(pledges.createdAt, start))
        );
      for (const p of pledgesSince) {
        const key = new Date(p.createdAt as unknown as Date)
          .toISOString()
          .split("T")[0];
        if (buckets[key]) buckets[key].pledges++;
      }

      const series = Object.entries(buckets)
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => (a.date < b.date ? -1 : 1));

      return c.json({ success: true, data: series });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error getting global time series:", error);
      throw new HTTPException(500, {
        message: "Error getting global time series",
      });
    }
  }

  /**
   * GET /api/admin-analytics/campaign/:campaignId/pledges?page=1&limit=20&q=
   * List pledges for a campaign with user info (privileged only)
   */
  async getCampaignPledges(c: Context) {
    try {
      ensurePrivileged(c);
      const { campaignId } = c.req.param();
      const page = Math.max(1, parseInt(c.req.query("page") || "1"));
      const limit = Math.max(
        1,
        Math.min(100, parseInt(c.req.query("limit") || "20"))
      );
      const q = (c.req.query("q") || "").trim().toLowerCase();
      const db = createDb(c.env.DB);

      // Server-side search and pagination
      const baseWhere = and(
        eq(pledges.campaignId, campaignId),
        eq(pledges.status, "active")
      );
      const whereWithSearch = q
        ? and(
            baseWhere,
            or(like(users.name, `%${q}%`), like(users.email, `%${q}%`))
          )
        : baseWhere;

      const total = (
        await db
          .select({ id: pledges.id })
          .from(pledges)
          .leftJoin(users, eq(users.id, pledges.userId))
          .where(whereWithSearch)
      ).length;

      const filtered = await db
        .select({
          pledgeId: pledges.id,
          userId: pledges.userId,
          createdAt: pledges.createdAt,
          subscribeToUpdates: pledges.subscribeToUpdates,
          userName: users.name,
          userEmail: users.email,
        })
        .from(pledges)
        .leftJoin(users, eq(users.id, pledges.userId))
        .where(whereWithSearch)
        .orderBy(desc(pledges.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      return c.json({
        success: true,
        data: {
          items: filtered,
          page,
          limit,
          total,
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error getting campaign pledges:", error);
      throw new HTTPException(500, {
        message: "Error getting campaign pledges",
      });
    }
  }
  /**
   * GET /api/admin-analytics/campaign/:campaignId/summary
   * Aggregated metrics for a campaign: solutions, interactions, comments, pledges
   */
  async getCampaignSummary(c: Context) {
    try {
      ensurePrivileged(c);
      const { campaignId } = c.req.param();
      if (!campaignId) {
        throw new HTTPException(400, { message: "campaignId is required" });
      }

      const db = createDb(c.env.DB);

      // Solutions published
      const publishedSolutions = await db
        .select({ id: solutions.id })
        .from(solutions)
        .where(
          and(
            eq(solutions.campaignId, campaignId),
            eq(solutions.status, "published")
          )
        );

      const solutionIds = publishedSolutions.map((s) => s.id);

      // Interactions and comments only if there are solutions
      let likes = 0;
      let dislikes = 0;
      let shares = 0;
      let commentsCount = 0;

      if (solutionIds.length > 0) {
        const interactions = await db.query.solutionInteractions.findMany({
          where: and(
            inArray(solutionInteractions.solutionId, solutionIds),
            eq(solutionInteractions.status, "active")
          ),
        });
        for (const it of interactions) {
          if (it.type === "like") likes++;
          else if (it.type === "dislike") dislikes++;
          else if (it.type === "share") shares++;
        }

        const activeComments = await db.query.comments.findMany({
          where: and(
            inArray(comments.solutionId, solutionIds),
            eq(comments.status, "active")
          ),
        });
        commentsCount = activeComments.length;
      }

      // Pledges for campaign
      const campaignPledges = await db
        .select({ id: pledges.id })
        .from(pledges)
        .where(
          and(eq(pledges.campaignId, campaignId), eq(pledges.status, "active"))
        );

      return c.json({
        success: true,
        data: {
          campaignId,
          solutionsPublished: publishedSolutions.length,
          interactions: { likes, dislikes, shares },
          comments: commentsCount,
          pledges: campaignPledges.length,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error getting campaign summary:", error);
      throw new HTTPException(500, {
        message: "Error getting campaign summary",
      });
    }
  }

  /**
   * GET /api/admin-analytics/campaign/:campaignId/timeseries?days=30
   * Returns daily time series for likes, dislikes, shares, comments, pledges
   */
  async getCampaignTimeSeries(c: Context) {
    try {
      ensurePrivileged(c);
      const { campaignId } = c.req.param();
      const days = Math.max(
        1,
        Math.min(365, parseInt(c.req.query("days") || "30"))
      );
      const db = createDb(c.env.DB);

      const start = new Date();
      start.setDate(start.getDate() - days + 1);
      start.setHours(0, 0, 0, 0);

      // Get published solutions for the campaign
      const publishedSolutions = await db
        .select({ id: solutions.id })
        .from(solutions)
        .where(
          and(
            eq(solutions.campaignId, campaignId),
            eq(solutions.status, "published")
          )
        );
      const solutionIds = publishedSolutions.map((s) => s.id);

      // Initialize buckets by day
      const buckets: Record<
        string,
        {
          likes: number;
          dislikes: number;
          shares: number;
          comments: number;
          pledges: number;
        }
      > = {};
      const iter = new Date(start);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      while (iter <= today) {
        const key = iter.toISOString().split("T")[0];
        buckets[key] = {
          likes: 0,
          dislikes: 0,
          shares: 0,
          comments: 0,
          pledges: 0,
        };
        iter.setDate(iter.getDate() + 1);
      }

      if (solutionIds.length > 0) {
        // Interactions since start
        const interactions = await db.query.solutionInteractions.findMany({
          where: and(
            inArray(solutionInteractions.solutionId, solutionIds),
            eq(solutionInteractions.status, "active"),
            gte(solutionInteractions.createdAt, start)
          ),
          orderBy: [desc(solutionInteractions.createdAt)],
        });
        for (const it of interactions) {
          const key = new Date(it.createdAt).toISOString().split("T")[0];
          if (!buckets[key]) continue;
          if (it.type === "like") buckets[key].likes++;
          else if (it.type === "dislike") buckets[key].dislikes++;
          else if (it.type === "share") buckets[key].shares++;
        }

        // Comments since start
        const activeComments = await db.query.comments.findMany({
          where: and(
            inArray(comments.solutionId, solutionIds),
            eq(comments.status, "active"),
            gte(comments.createdAt, start)
          ),
          orderBy: [desc(comments.createdAt)],
        });
        for (const cm of activeComments) {
          const key = new Date(cm.createdAt).toISOString().split("T")[0];
          if (buckets[key]) buckets[key].comments++;
        }
      }

      // Pledges since start
      const pledgesSince = await db
        .select({ id: pledges.id, createdAt: pledges.createdAt })
        .from(pledges)
        .where(
          and(
            eq(pledges.campaignId, campaignId),
            eq(pledges.status, "active"),
            gte(pledges.createdAt, start)
          )
        );
      for (const p of pledgesSince) {
        const key = new Date(p.createdAt as unknown as Date)
          .toISOString()
          .split("T")[0];
        if (buckets[key]) buckets[key].pledges++;
      }

      // Emit sorted series
      const series = Object.entries(buckets)
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => (a.date < b.date ? -1 : 1));

      return c.json({ success: true, data: series });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error getting campaign time series:", error);
      throw new HTTPException(500, {
        message: "Error getting campaign time series",
      });
    }
  }

  /**
   * GET /api/admin-analytics/recent-activity?campaignId=...&limit=50
   * Recent interactions/comments/pledges for polling-based real-time tracking
   */
  async getRecentActivity(c: Context) {
    try {
      ensurePrivileged(c);
      const campaignId = c.req.query("campaignId");
      const sinceParam = c.req.query("since");
      const sinceDate = sinceParam ? new Date(sinceParam) : null;
      const limit = Math.max(
        1,
        Math.min(200, parseInt(c.req.query("limit") || "50"))
      );
      const db = createDb(c.env.DB);

      // Solutions filter if campaignId provided
      let solutionIds: string[] | null = null;
      if (campaignId) {
        const pub = await db
          .select({ id: solutions.id })
          .from(solutions)
          .where(
            and(
              eq(solutions.campaignId, campaignId),
              eq(solutions.status, "published")
            )
          );
        solutionIds = pub.map((s) => s.id);
      }

      // Fetch recent items separately and merge by createdAt
      const interactions = await db.query.solutionInteractions.findMany({
        where:
          campaignId && solutionIds && solutionIds.length > 0
            ? sinceDate
              ? and(
                  inArray(solutionInteractions.solutionId, solutionIds),
                  eq(solutionInteractions.status, "active"),
                  gt(solutionInteractions.createdAt, sinceDate)
                )
              : and(
                  inArray(solutionInteractions.solutionId, solutionIds),
                  eq(solutionInteractions.status, "active")
                )
            : sinceDate
              ? and(
                  eq(solutionInteractions.status, "active"),
                  gt(solutionInteractions.createdAt, sinceDate)
                )
              : eq(solutionInteractions.status, "active"),
        orderBy: [desc(solutionInteractions.createdAt)],
        limit,
      });

      const activeComments = await db.query.comments.findMany({
        where:
          campaignId && solutionIds && solutionIds.length > 0
            ? sinceDate
              ? and(
                  inArray(comments.solutionId, solutionIds),
                  eq(comments.status, "active"),
                  gt(comments.createdAt, sinceDate)
                )
              : and(
                  inArray(comments.solutionId, solutionIds),
                  eq(comments.status, "active")
                )
            : sinceDate
              ? and(
                  eq(comments.status, "active"),
                  gt(comments.createdAt, sinceDate)
                )
              : eq(comments.status, "active"),
        orderBy: [desc(comments.createdAt)],
        limit,
      });

      const campaignPledges = campaignId
        ? await db
            .select({
              id: pledges.id,
              createdAt: pledges.createdAt,
              userId: pledges.userId,
              campaignId: pledges.campaignId,
            })
            .from(pledges)
            .where(
              sinceDate
                ? and(
                    eq(pledges.campaignId, campaignId),
                    eq(pledges.status, "active"),
                    gt(pledges.createdAt, sinceDate)
                  )
                : and(
                    eq(pledges.campaignId, campaignId),
                    eq(pledges.status, "active")
                  )
            )
            .orderBy(desc(pledges.createdAt))
            .limit(limit)
        : await db
            .select({
              id: pledges.id,
              createdAt: pledges.createdAt,
              userId: pledges.userId,
              campaignId: pledges.campaignId,
            })
            .from(pledges)
            .where(
              sinceDate
                ? and(
                    eq(pledges.status, "active"),
                    gt(pledges.createdAt, sinceDate)
                  )
                : eq(pledges.status, "active")
            )
            .orderBy(desc(pledges.createdAt))
            .limit(limit);

      type Item = { type: string; createdAt: Date; meta: Record<string, any> };
      const items: Item[] = [];
      for (const it of interactions) {
        items.push({
          type: it.type,
          createdAt: it.createdAt as any,
          meta: { solutionId: it.solutionId, userId: it.userId },
        });
      }
      for (const cm of activeComments) {
        items.push({
          type: "comment",
          createdAt: cm.createdAt as any,
          meta: { solutionId: cm.solutionId, userId: cm.userId },
        });
      }
      for (const p of campaignPledges) {
        items.push({
          type: "pledge",
          createdAt: p.createdAt as any,
          meta: {
            userId: (p as any).userId,
            campaignId: (p as any).campaignId,
          },
        });
      }

      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Enriquecer con datos de usuario (nombre, imagen, email) cuando esté disponible
      const userIds = Array.from(
        new Set(
          items
            .map((it) => it.meta?.userId)
            .filter((v): v is string => typeof v === "string" && v.length > 0)
        )
      );
      let userMap: Record<
        string,
        { name: string | null; image: string | null; email: string | null }
      > = {};
      if (userIds.length > 0) {
        const rows = await db
          .select({
            id: users.id,
            name: users.name,
            image: users.image,
            email: users.email,
          })
          .from(users)
          .where(inArray(users.id, userIds));
        userMap = Object.fromEntries(
          rows.map((u) => [
            u.id,
            { name: u.name, image: u.image, email: u.email },
          ])
        );
      }

      // Mapear solutionId -> {title, campaignId}
      const solIds = Array.from(
        new Set(
          items
            .map((it) => it.meta?.solutionId)
            .filter((v): v is string => typeof v === "string" && v.length > 0)
        )
      );
      let solutionMap: Record<
        string,
        { title: string | null; campaignId: string | null }
      > = {};
      if (solIds.length > 0) {
        const srows = await db
          .select({
            id: solutions.id,
            title: solutions.title,
            campaignId: solutions.campaignId,
          })
          .from(solutions)
          .where(inArray(solutions.id, solIds));
        solutionMap = Object.fromEntries(
          srows.map((s) => [s.id, { title: s.title, campaignId: s.campaignId }])
        );
      }

      const enriched = items.slice(0, limit).map((it) => {
        const u = it.meta?.userId ? userMap[it.meta.userId] : undefined;
        const sol = it.meta?.solutionId
          ? solutionMap[it.meta.solutionId]
          : undefined;
        return {
          ...it,
          meta: {
            ...it.meta,
            ...(u
              ? { userName: u.name, userImage: u.image, userEmail: u.email }
              : {}),
            ...(sol
              ? { solutionTitle: sol.title, solutionCampaignId: sol.campaignId }
              : {}),
          },
        };
      });

      return c.json({ success: true, data: enriched });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error getting recent activity:", error);
      throw new HTTPException(500, {
        message: "Error getting recent activity",
      });
    }
  }
}
