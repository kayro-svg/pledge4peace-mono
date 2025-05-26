import { Context } from "hono";
import { CommentsService } from "../services/comments.service";
import { createDb } from "../db";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { getAuthUser } from "../middleware/auth.middleware";

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
      console.error("Error getting comments:", error);
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
      });

      return c.json(comment, 201);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error creating comment:", error);
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
      console.error("Error updating comment:", error);
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

      // Verificar que el usuario es el propietario del comentario
      if (existingComment.userId !== user.id) {
        throw new HTTPException(403, {
          message: "You don't have permission to delete this comment",
        });
      }

      await service.deleteComment(id, user.id);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error deleting comment:", error);
      throw new HTTPException(500, { message: "Error deleting comment" });
    }
  }
}
