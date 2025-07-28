import { eq, and, desc, inArray } from "drizzle-orm";
import { comments } from "../db/schema/comments";
import type { DbClient } from "../types";

export interface CreateCommentDTO {
  solutionId: string;
  userId: string;
  content: string;
  parentId?: string;
  userName?: string;
  userAvatar?: string;
}

export interface UpdateCommentDTO {
  content: string;
}

type Comment = typeof comments.$inferSelect;

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

export class CommentsService {
  constructor(private db: DbClient) {}

  async createComment(data: CreateCommentDTO): Promise<CommentWithReplies> {
    const newComment = await this.db
      .insert(comments)
      .values({
        id: crypto.randomUUID(),
        solutionId: data.solutionId,
        userId: data.userId,
        content: data.content,
        parentId: data.parentId || null,
        userName: data.userName,
        userAvatar: data.userAvatar,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const comment = newComment[0];
    return {
      ...comment,
      replies: [], // Initialize empty replies array for consistency
    } as CommentWithReplies;
  }

  async getCommentsBySolution(
    solutionId: string
  ): Promise<CommentWithReplies[]> {
    const allComments = await this.db.query.comments.findMany({
      where: and(
        eq(comments.solutionId, solutionId),
        eq(comments.status, "active")
      ),
      orderBy: [desc(comments.createdAt)],
    });

    // Organizar comentarios en estructura jerárquica
    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    // Primero, mapear todos los comentarios por ID
    allComments.forEach((comment) => {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
      } as unknown as CommentWithReplies);
    });

    // Luego, organizar la estructura jerárquica
    allComments.forEach((comment) => {
      if (comment.parentId) {
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  }

  async updateComment(id: string, userId: string, data: UpdateCommentDTO) {
    const updated = await this.db
      .update(comments)
      .set({
        content: data.content,
        updatedAt: new Date(),
      })
      .where(and(eq(comments.id, id), eq(comments.userId, userId)))
      .returning();

    return updated[0];
  }

  async deleteComment(id: string, userId: string) {
    // 1. Primero, encontrar todos los comentarios hijos (replies) recursivamente
    const allChildCommentIds = await this.findAllChildCommentIds(id);

    // 2. Marcar el comentario principal como eliminado
    const updated = await this.db
      .update(comments)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();

    // 3. Si hay comentarios hijos, marcarlos como eliminados también
    if (allChildCommentIds.length > 0) {
      await this.db
        .update(comments)
        .set({
          status: "deleted",
          updatedAt: new Date(),
        })
        .where(inArray(comments.id, allChildCommentIds));
    }

    return updated[0];
  }

  // Método auxiliar para encontrar todos los IDs de comentarios hijos recursivamente
  async findAllChildCommentIds(commentId: string): Promise<string[]> {
    // 1. Encontrar los hijos directos
    const directChildren = await this.db.query.comments.findMany({
      where: eq(comments.parentId, commentId),
      columns: { id: true },
    });

    // 2. Si no hay hijos, retornar array vacío
    if (directChildren.length === 0) {
      return [];
    }

    // 3. Obtener los IDs de los hijos directos
    const directChildrenIds = directChildren.map((child) => child.id);

    // 4. Para cada hijo directo, encontrar sus hijos recursivamente
    const nestedChildrenIds: string[] = [];
    for (const childId of directChildrenIds) {
      const nestedIds = await this.findAllChildCommentIds(childId);
      nestedChildrenIds.push(...nestedIds);
    }

    // 5. Combinar todos los IDs (directos + anidados)
    return [...directChildrenIds, ...nestedChildrenIds];
  }

  async getCommentById(id: string) {
    return this.db.query.comments.findFirst({
      where: eq(comments.id, id),
    });
  }
}
