import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { UserInvolvementService } from "../services/user-involvement.service";
import { createDb } from "../db";
import { getAuthUser } from "../middleware/auth.middleware";
import { logger } from "../utils/logger";

export class UserInvolvementController {
  async getDashboard(c: Context) {
    try {
      const user = getAuthUser(c);
      const db = createDb(c.env.DB);
      const service = new UserInvolvementService(db);

      // Get campaign titles from query params (if provided by frontend)
      const campaignTitlesParam = c.req.query("campaignTitles");
      let campaignTitles:
        | Record<string, { title: string; category: string }>
        | undefined;

      if (campaignTitlesParam) {
        try {
          campaignTitles = JSON.parse(campaignTitlesParam);
        } catch (error) {
          logger.error("Invalid campaignTitles format:", error);
        }
      }

      const involvement = await service.getUserInvolvement(
        user.id,
        campaignTitles
      );

      return c.json({
        success: true,
        data: involvement,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching user involvement:", error);
      return c.json(
        { success: false, error: "Failed to fetch user involvement data" },
        500
      );
    }
  }

  async getStats(c: Context) {
    try {
      const user = getAuthUser(c);
      const db = createDb(c.env.DB);
      const service = new UserInvolvementService(db);

      const stats = await service.getUserInvolvementStats(user.id);

      return c.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching user involvement stats:", error);
      return c.json(
        { success: false, error: "Failed to fetch user involvement stats" },
        500
      );
    }
  }

  async getActivity(c: Context) {
    try {
      const user = getAuthUser(c);
      const db = createDb(c.env.DB);
      const service = new UserInvolvementService(db);

      const limit = parseInt(c.req.query("limit") || "20");
      const activities = await service.getUserRecentActivity(user.id, limit);

      return c.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching user activity:", error);
      return c.json(
        { success: false, error: "Failed to fetch user activity" },
        500
      );
    }
  }

  async getComments(c: Context) {
    try {
      const user = getAuthUser(c);
      const db = createDb(c.env.DB);
      const service = new UserInvolvementService(db);

      const limit = parseInt(c.req.query("limit") || "10");
      const comments = await service.getUserRecentComments(user.id, limit);

      return c.json({
        success: true,
        data: comments,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching user comments:", error);
      return c.json(
        { success: false, error: "Failed to fetch user comments" },
        500
      );
    }
  }
}
