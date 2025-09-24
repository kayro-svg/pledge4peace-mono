import { Context } from "hono";
import { SolutionsService } from "../services/solutions.service";
import { createDb } from "../db";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import {
  getAuthUser,
  canDeleteResource,
  isSuperAdmin,
} from "../middleware/auth.middleware";
import { solutions } from "../db/schema/solutions";
import { users } from "../db/schema/users";
import { and, eq } from "drizzle-orm";
import { logger } from "../utils/logger";
import { NotificationsService } from "../services/notifications.service";
import { users as usersTable } from "../db/schema/users";
import { inArray } from "drizzle-orm";

// Validación de entrada para crear una solución
const createSolutionSchema = z.object({
  campaignId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  partyId: z.string().min(1), // Cambió de enum fijo a string genérico
  metadata: z.record(z.any()).optional(),
  // New: Party limits information from CMS
  partyLimits: z.record(z.number()).optional(),
  // Moderation: allow optional status for privileged users
  status: z.enum(["draft", "published", "archived"]).optional(),
});

// Validación para actualizar una solución (parcial)
const updateSolutionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  partyId: z.string().min(1).optional(),
  metadata: z.record(z.any()).nullable().optional(),
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

  async getSolutionsForModeration(c: Context) {
    try {
      // Privileged roles only
      const user = getAuthUser(c);
      const isPrivileged =
        user.role === "superAdmin" ||
        user.role === "admin" ||
        user.role === "moderator";
      if (!isPrivileged) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);
      const statusParam =
        (c.req.query("status") as
          | "draft"
          | "published"
          | "archived"
          | undefined) || "draft";
      const campaignId = c.req.query("campaignId") || undefined;
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");
      const q = c.req.query("q") || undefined;

      const rows = await service.getSolutionsForModeration(
        statusParam,
        campaignId,
        page,
        limit,
        q
      );
      return c.json(rows);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching moderation list:", error);
      throw new HTTPException(500, {
        message: "Error fetching moderation list",
      });
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

      // Default status: draft (pending moderation)
      // Privileged users (moderator/admin/superAdmin) auto-publish unless they explicitly provide a status
      const desiredStatus = validation.data.status;
      const isPrivileged =
        user.role === "superAdmin" ||
        user.role === "admin" ||
        user.role === "moderator";
      const finalStatus = isPrivileged
        ? (desiredStatus ?? "published")
        : "draft";

      const solution = await service.createSolution({
        ...validation.data,
        status: finalStatus,
        userId: user.id,
      });

      // Notify admin about new draft for moderation (best-effort)
      if (finalStatus === "draft") {
        try {
          const authService = c.get("authService");
          await authService.emailService.sendNewSolutionModerationNotification({
            authorName: user.name,
            authorEmail: user.email,
            title: validation.data.title,
            description: validation.data.description,
            campaignId: validation.data.campaignId,
            campaignTitle:
              (validation.data.metadata &&
                (validation.data.metadata as any).campaignTitle) ||
              undefined,
            campaignSlug:
              (validation.data.metadata &&
                (validation.data.metadata as any).campaignSlug) ||
              undefined,
            // Optional: include slug if needed later in email templates
            // campaignSlug: (validation.data.metadata as any)?.campaignSlug,
          });
          // Also notify moderators/admins/superAdmin in-app (best-effort)
          try {
            const moderators = await db
              .select({ id: usersTable.id })
              .from(usersTable)
              .where(
                inArray(usersTable.role as any, [
                  "moderator",
                  "admin",
                  "superAdmin",
                ])
              );
            const notif = new NotificationsService(db, c.env.KV as KVNamespace);
            await Promise.all(
              moderators.map((m) =>
                notif.create({
                  userId: m.id,
                  type: "moderation_new_draft",
                  title: "New solution pending review",
                  body: `${user.name} submitted "${validation.data.title}"`,
                  href: `/dashboard/moderate-campaigns-solutions`,
                  meta: {
                    campaignId: validation.data.campaignId,
                    solutionId: solution.id,
                    campaignSlug:
                      (validation.data.metadata &&
                        (validation.data.metadata as any).campaignSlug) ||
                      undefined,
                  },
                  actorId: user.id,
                  resourceType: "solution",
                  resourceId: solution.id,
                })
              )
            );
          } catch {}
        } catch (e) {
          // non-blocking
        }
      }

      return c.json(solution, 201);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error creating solution:", error);

      // Handle solution limit error
      if (error instanceof Error && error.message.includes("maximum limit")) {
        throw new HTTPException(400, { message: error.message });
      }

      // Handle invalid party error
      if (error instanceof Error && error.message.includes("Invalid party")) {
        throw new HTTPException(400, { message: error.message });
      }

      throw new HTTPException(500, { message: "Error creating solution" });
    }
  }

  async updateSolutionStatus(c: Context) {
    try {
      const { id } = c.req.param();
      const { status, reason } = await c.req.json();

      if (!["draft", "published", "archived"].includes(status)) {
        throw new HTTPException(400, { message: "Invalid status" });
      }

      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);

      // Only moderators/admins/superAdmin can approve (publish) or reject (archived)
      const user = getAuthUser(c);
      const isPrivileged =
        user.role === "superAdmin" ||
        user.role === "admin" ||
        user.role === "moderator";
      if (!isPrivileged) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      const solution = await service.updateSolutionStatus(id, status);
      if (!solution) {
        throw new HTTPException(404, { message: "Solution not found" });
      }

      // Email notify author about result (best-effort)
      // Only notify when moving to published (approved). Skip when reverting to draft or rejecting (archived).
      if (status === "published") {
        try {
          const authService = c.get("authService");
          const author = await db.query.users.findFirst({
            where: eq(users.id, solution.userId),
            columns: { email: true, name: true, notifyEmail: true },
          });
          if (author?.email) {
            try {
              if (Number((author as any).notifyEmail ?? 1) !== 0)
                await authService.emailService.sendSolutionModerationResult({
                  to: author.email,
                  userName: author.name || undefined,
                  result: "approved",
                  title: solution.title,
                  reason,
                  campaignTitle: (() => {
                    try {
                      return solution.metadata
                        ? JSON.parse(solution.metadata as any).campaignTitle
                        : undefined;
                    } catch (e) {
                      return undefined;
                    }
                  })(),
                  campaignId: solution.campaignId,
                  campaignSlug: (() => {
                    try {
                      return solution.metadata
                        ? JSON.parse(solution.metadata as any).campaignSlug
                        : undefined;
                    } catch (e) {
                      return undefined;
                    }
                  })(),
                });
            } catch (e) {
              logger.error("Error sending solution moderation result:", e);
            }
          }
          // In-app notification to the author (best-effort)
          try {
            const notif = new NotificationsService(db, c.env.KV as KVNamespace);
            const metaParsed = (() => {
              try {
                return solution.metadata
                  ? JSON.parse(solution.metadata as any)
                  : undefined;
              } catch (e) {
                return undefined;
              }
            })();
            await notif.create({
              userId: solution.userId,
              type: "solution_approved",
              title: "Your solution was approved",
              body: solution.title,
              href: undefined,
              meta: {
                solutionId: solution.id,
                campaignId: solution.campaignId,
                campaignSlug: metaParsed?.campaignSlug,
                campaignTitle: metaParsed?.campaignTitle,
              },
              actorId: user.id,
              resourceType: "solution",
              resourceId: solution.id,
            });
          } catch {}
        } catch (e) {
          // non-blocking
        }
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

  /**
   * Update solution content (title/description/partyId/metadata)
   * Only privileged roles (moderator/admin/superAdmin) are allowed
   */
  async updateSolution(c: Context) {
    try {
      const { id } = c.req.param();
      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);

      // Only moderators/admins/superAdmin can edit
      const user = getAuthUser(c);
      const isPrivileged =
        user.role === "superAdmin" ||
        user.role === "admin" ||
        user.role === "moderator";
      if (!isPrivileged) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      const validation = await c.req
        .json()
        .then((data) => updateSolutionSchema.safeParse(data));

      if (!validation.success) {
        throw new HTTPException(400, { message: "Invalid input data" });
      }

      // Ensure solution exists (can include drafts/archived for editing)
      const existing = await db.query.solutions.findFirst({
        where: eq(solutions.id, id),
      });
      if (!existing) {
        throw new HTTPException(404, { message: "Solution not found" });
      }

      const updated = await service.updateSolution(id, validation.data);
      return c.json(updated);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error updating solution:", error);
      throw new HTTPException(500, { message: "Error updating solution" });
    }
  }

  async approveAllDrafts(c: Context) {
    try {
      const user = getAuthUser(c);
      const isPrivileged =
        user.role === "superAdmin" ||
        user.role === "admin" ||
        user.role === "moderator";
      if (!isPrivileged) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      const campaignId = c.req.query("campaignId") || undefined;
      const db = createDb(c.env.DB);
      const service = new SolutionsService(db);
      const updated = await service.approveAllDrafts(campaignId);

      // Best-effort email notifications to authors
      const authService = c.get("authService");
      for (const item of updated) {
        const author = await db.query.users.findFirst({
          where: eq(users.id, item.userId),
          columns: { email: true, name: true },
        });
        if (author?.email) {
          try {
            await authService.emailService.sendSolutionModerationResult({
              to: author.email,
              userName: author.name || undefined,
              result: "approved",
              title: item.title,
              campaignTitle: (() => {
                try {
                  return item.metadata
                    ? JSON.parse(item.metadata as any).campaignTitle
                    : undefined;
                } catch (e) {
                  return undefined;
                }
              })(),
              campaignId: item.campaignId,
              campaignSlug: (() => {
                try {
                  return item.metadata
                    ? JSON.parse(item.metadata as any).campaignSlug
                    : undefined;
                } catch (e) {
                  return undefined;
                }
              })(),
            });
          } catch {}
        }
        // In-app notification to each author (best-effort)
        try {
          const notif = new NotificationsService(db, c.env.KV as KVNamespace);
          const metaParsed = (() => {
            try {
              return item.metadata
                ? JSON.parse(item.metadata as any)
                : undefined;
            } catch (e) {
              return undefined;
            }
          })();
          await notif.create({
            userId: item.userId,
            type: "solution_approved",
            title: "Your solution was approved",
            body: item.title,
            href: undefined,
            meta: {
              solutionId: item.id,
              campaignId: item.campaignId,
              campaignSlug: metaParsed?.campaignSlug,
              campaignTitle: metaParsed?.campaignTitle,
            },
            actorId: user.id,
            resourceType: "solution",
            resourceId: item.id,
          });
        } catch {}
      }

      return c.json({
        success: true,
        approved: updated.length,
        items: updated,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error approving all drafts:", error);
      throw new HTTPException(500, { message: "Error approving drafts" });
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
