import { Context } from "hono";
import { SolutionsService } from "../services/solutions.service";
import { createDb } from "../db";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getAuthUser } from "../middleware/auth.middleware";
import { solutions } from "../db/schema/solutions";
import { and, eq } from "drizzle-orm";

// Validación de entrada para crear una solución
const createSolutionSchema = z.object({
  campaignId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export class SolutionsController {
  async getSolutionsByCampaign(c: Context) {
    try {
      const { campaignId } = c.req.param();
      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);

      const solutions = await service.getSolutionsByCampaign(campaignId);
      return c.json(solutions);
    } catch (error) {
      console.error("Error getting solutions:", error);
      throw new HTTPException(500, { message: "Error getting solutions" });
    }
  }

  async getSolutionById(c: Context) {
    try {
      const { id } = c.req.param();
      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);

      const solution = await service.getSolutionById(id);
      if (!solution) {
        throw new HTTPException(404, { message: "Solution not found" });
      }

      return c.json(solution);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error getting solution:", error);
      throw new HTTPException(500, { message: "Error getting solution" });
    }
  }

  async createSolution(c: Context) {
    try {
      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);

      // Get and validate input data
      const validation = await c.req
        .json()
        .then((data) => createSolutionSchema.safeParse(data));

      if (!validation.success) {
        throw new HTTPException(400, { message: "Invalid input data" });
      }

      // Get authenticated user
      const user = getAuthUser(c);

      const solution = await service.createSolution({
        ...validation.data,
        userId: user.id,
      });

      return c.json(solution, 201);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error creating solution:", error);
      
      // Handle solution limit error
      if (error instanceof Error && error.message.includes("maximum limit")) {
        throw new HTTPException(400, { message: error.message });
      }
      
      throw new HTTPException(500, { message: "Error creating solution" });
    }
  }

  async updateSolutionStatus(c: Context) {
    try {
      const { id } = c.req.param();
      const { status } = await c.req.json();

      if (!["draft", "published", "archived"].includes(status)) {
        throw new HTTPException(400, { message: "Invalid status" });
      }

      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);

      const solution = await service.updateSolutionStatus(id, status);
      if (!solution) {
        throw new HTTPException(404, { message: "Solution not found" });
      }

      return c.json(solution);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error updating solution status:", error);
      throw new HTTPException(500, {
        message: "Error updating solution status",
      });
    }
  }

  async getSolutionsStatsByCampaign(c: Context) {
    try {
      const { campaignId } = c.req.param();
      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);
      const stats = await service.getSolutionsStatsByCampaign(campaignId);
      return c.json(stats);
    } catch (error) {
      console.error("Error getting solutions stats by campaign:", error);
      throw new HTTPException(500, {
        message: "Error getting solutions stats by campaign",
      });
    }
  }

  /**
   * Get the number of solutions the current user has created for a campaign
   */
  async getUserSolutionCount(c: Context) {
    try {
      const { campaignId } = c.req.param();
      const user = getAuthUser(c);
      const db = createDb(c.env.DB);
      
      const count = await db
        .select()
        .from(solutions)
        .where(
          and(
            eq(solutions.campaignId, campaignId),
            eq(solutions.userId, user.id),
            eq(solutions.status, "published")
          )
        )
        .then(rows => rows.length);

      return c.json({ count });
    } catch (error) {
      console.error("Error getting user solution count:", error);
      throw new HTTPException(500, {
        message: "Error getting user solution count",
      });
    }
  }
}
