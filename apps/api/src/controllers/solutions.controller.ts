import { Context } from "hono";
import { SolutionsService } from "../services/solutions.service";
import { createDb } from "../db";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getAuthUser } from "../middleware/auth.middleware";

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

      // Obtener y validar los datos de entrada
      const validation = await c.req
        .json()
        .then((data) => createSolutionSchema.safeParse(data));

      if (!validation.success) {
        throw new HTTPException(400, { message: "Invalid input data" });
      }

      // Obtener el usuario autenticado
      const user = getAuthUser(c);

      const solution = await service.createSolution({
        ...validation.data,
        userId: user.id,
      });

      return c.json(solution, 201);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error creating solution:", error);
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
}
