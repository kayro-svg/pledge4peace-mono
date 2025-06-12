import { Context } from "hono";
import { SolutionsService } from "../services/solutions.service";
import { createDb } from "../db";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getAuthUser,
  canDeleteResource,
  isSuperAdmin,
} from "../middleware/auth.middleware";
import { solutions } from "../db/schema/solutions";
import { and, eq } from "drizzle-orm";
import { logger } from "../utils/logger";

// Validación de entrada para crear una solución
const createSolutionSchema = z.object({
  campaignId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  partyId: z.enum(["israeli", "palestinian"], {
    errorMap: () => ({
      message: "Party must be either 'israeli' or 'palestinian'",
    }),
  }),
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
      logger.error("Error getting solutions:", error);
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
      logger.error("Error getting solution:", error);
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
      logger.error("Error creating solution:", error);

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
      logger.error("Error updating solution status:", error);
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
      logger.error("Error getting solutions stats by campaign:", error);
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
        .then((rows) => rows.length);

      return c.json({ count });
    } catch (error) {
      logger.error("Error getting user solution count:", error);
      throw new HTTPException(500, {
        message: "Error getting user solution count",
      });
    }
  }

  /**
   * Get the number of solutions per party for a campaign
   */
  async getPartySolutionCounts(c: Context) {
    try {
      const { campaignId } = c.req.param();
      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);

      const counts = await service.getPartySolutionCounts(campaignId);
      return c.json(counts);
    } catch (error) {
      logger.error("Error getting party solution counts:", error);
      throw new HTTPException(500, {
        message: "Error getting party solution counts",
      });
    }
  }

  /**
   * Delete a solution - Solo permitido por el propietario o superAdmin
   * SuperAdmin puede eliminar cualquier solution como función de moderación
   */
  async deleteSolution(c: Context) {
    try {
      const { id } = c.req.param();
      const user = getAuthUser(c);
      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);

      // Obtener la solution para verificar propiedad
      const existingSolution = await service.getSolutionById(id);
      if (!existingSolution) {
        throw new HTTPException(404, { message: "Solution not found" });
      }

      // Verificar permisos: propietario O superAdmin
      if (!canDeleteResource(c, existingSolution.userId)) {
        throw new HTTPException(403, {
          message: "You don't have permission to delete this solution",
        });
      }

      // Log de auditoría para acciones de moderación
      if (isSuperAdmin(c) && existingSolution.userId !== user.id) {
        logger.log(
          `🔨 MODERATION: SuperAdmin ${user.email} deleted solution ${id} owned by user ${existingSolution.userId}`
        );
      }

      // Realizar eliminación (soft delete cambiando status a 'archived')
      const deletedSolution = await service.updateSolutionStatus(
        id,
        "archived"
      );

      return c.json({
        success: true,
        message: "Solution deleted successfully",
        solutionId: id,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error deleting solution:", error);
      throw new HTTPException(500, { message: "Error deleting solution" });
    }
  }
}
