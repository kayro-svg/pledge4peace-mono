import { Context } from "hono";
import { CommentsService } from "../services/comments.service";
import { createDb } from "../db";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import {
  getAuthUser,
  canDeleteResource,
  isSuperAdmin,
} from "../middleware/auth.middleware";
import { logger } from "../utils/logger";

// Validación de entrada para crear un comentario
const createCommentSchema = z.object({
  solutionId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
});

// Validación para actualizar un comentario
const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export class CommentsController {
  async getCommentsBySolution(c: Context) {
    try {
      const { solutionId } = c.req.param();
      const db = createDb(c.env.DB);
      const service = new CommentsService(db);

      const comments = await service.getCommentsBySolution(solutionId);
      return c.json(comments);
    } catch (error) {
      logger.error("Error getting comments:", error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: "Error getting comments" });
    }
  }

  async createComment(c: Context) {
    try {
      const validation = createCommentSchema.safeParse(await c.req.json());

      if (!validation.success) {
        throw new HTTPException(400, {
          message: validation.error.errors.map((e) => e.message).join(", "),
        });
      }

      const user = getAuthUser(c);
      const db = createDb(c.env.DB);
      const service = new CommentsService(db);

      const comment = await service.createComment({
        ...validation.data,
        userId: user.id,
        userName: user.name,
        userAvatar: user.image,
      });

      return c.json(comment, 201);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error creating comment:", error);
      throw new HTTPException(500, { message: "Error creating comment" });
    }
  }

  async updateComment(c: Context) {
    try {
      const { id } = c.req.param();
      const validation = updateCommentSchema.safeParse(await c.req.json());

      if (!validation.success) {
        throw new HTTPException(400, {
          message: validation.error.errors.map((e) => e.message).join(", "),
        });
      }

      const user = getAuthUser(c);
      const db = createDb(c.env.DB);
      const service = new CommentsService(db);

      // Obtener el comentario para verificar propiedad
      const existingComment = await service.getCommentById(id);
      if (!existingComment) {
        throw new HTTPException(404, { message: "Comment not found" });
      }

      // Verificar que el usuario es el propietario del comentario
      if (existingComment.userId !== user.id) {
        throw new HTTPException(403, {
          message: "You don't have permission to update this comment",
        });
      }

      const comment = await service.updateComment(id, user.id, validation.data);
      return c.json(comment);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error updating comment:", error);
      throw new HTTPException(500, { message: "Error updating comment" });
    }
  }

  async deleteComment(c: Context) {
    try {
      const { id } = c.req.param();
      const user = getAuthUser(c);
      const db = createDb(c.env.DB);
      const service = new CommentsService(db);

      // Obtener el comentario para verificar propiedad
      const existingComment = await service.getCommentById(id);
      if (!existingComment) {
        throw new HTTPException(404, { message: "Comment not found" });
      }

      // Verificar permisos: propietario O superAdmin
      if (!canDeleteResource(c, existingComment.userId)) {
        throw new HTTPException(403, {
          message: "You don't have permission to delete this comment",
        });
      }

      // Log de auditoría para acciones de moderación
      if (isSuperAdmin(c) && existingComment.userId !== user.id) {
        logger.log(
          `🔨 MODERATION: SuperAdmin ${user.email} deleted comment ${id} owned by user ${existingComment.userId}`
        );
      }

      // Para superAdmin, pasar el userId original para tracking,
      // para usuarios normales pasar su propio userId
      const userIdForDeletion = isSuperAdmin(c)
        ? existingComment.userId
        : user.id;
      await service.deleteComment(id, userIdForDeletion);

      return c.json({
        success: true,
        message: "Comment deleted successfully",
        commentId: id,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error deleting comment:", error);
      throw new HTTPException(500, { message: "Error deleting comment" });
    }
  }
}
