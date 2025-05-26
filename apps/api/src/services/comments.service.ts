import { eq, and, desc } from "drizzle-orm";
import { comments } from "../db/schema/comments";
import type { DbClient } from "../types";

export interface CreateCommentDTO {
  solutionId: string;
  userId: string;
  content: string;
  parentId?: string;
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

  async createComment(data: CreateCommentDTO) {
    const newComment = await this.db
      .insert(comments)
      .values({
        id: crypto.randomUUID(),
        solutionId: data.solutionId,
        userId: data.userId,
        content: data.content,
        parentId: data.parentId || null,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newComment[0];
  }

  async getCommentsBySolution(
    solutionId: string
  ): Promise<CommentWithReplies[]> {
    const allComments = await this.db.query.comments.findMany({
      where: eq(comments.solutionId, solutionId),
      orderBy: [desc(comments.createdAt)],
    });

    // Organizar comentarios en estructura jerárquica
    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    // Primero, mapear todos los comentarios por ID
    allComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
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
    const updated = await this.db
      .update(comments)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(and(eq(comments.id, id), eq(comments.userId, userId)))
      .returning();

    return updated[0];
  }

  async getCommentById(id: string) {
    return this.db.query.comments.findFirst({
      where: eq(comments.id, id),
    });
  }
}
