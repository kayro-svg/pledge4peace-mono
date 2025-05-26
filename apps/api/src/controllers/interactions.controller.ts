import { Context } from "hono";
import { InteractionsService } from "../services/interactions.service";
import { createDb } from "../db";
import { HTTPException } from "hono/http-exception";
import { getAuthUser } from "../middleware/auth.middleware";

export class InteractionsController {
  async toggleLike(c: Context) {
    try {
      const { solutionId } = c.req.param();
      const user = getAuthUser(c);

      const db = createDb(c.env.DB);
      const service = new InteractionsService(db);

      const isLiked = await service.toggleLike(solutionId, user.id);
      return c.json({ liked: isLiked });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error toggling like:", error);
      throw new HTTPException(500, { message: "Error toggling like" });
    }
  }

  async shareSolution(c: Context) {
    try {
      const { solutionId } = c.req.param();
      const user = getAuthUser(c);

      const db = createDb(c.env.DB);
      const service = new InteractionsService(db);

      const share = await service.shareSolution(solutionId, user.id);
      return c.json(share, 201);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error sharing solution:", error);
      throw new HTTPException(500, { message: "Error sharing solution" });
    }
  }

  async getInteractionStats(c: Context) {
    try {
      const { solutionId } = c.req.param();
      const db = createDb(c.env.DB);
      const service = new InteractionsService(db);

      const stats = await service.getInteractionStats(solutionId);
      return c.json(stats);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error getting interaction stats:", error);
      throw new HTTPException(500, {
        message: "Error getting interaction stats",
      });
    }
  }

  async getUserInteractions(c: Context) {
    try {
      const { solutionId } = c.req.param();
      const user = getAuthUser(c);

      const db = createDb(c.env.DB);
      const service = new InteractionsService(db);

      const interactions = await service.getUserInteraction(
        solutionId,
        user.id
      );
      return c.json(interactions);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error getting user interactions:", error);
      throw new HTTPException(500, {
        message: "Error getting user interactions",
      });
    }
  }
}
