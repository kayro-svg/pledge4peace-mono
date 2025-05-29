import { eq, and, sql } from "drizzle-orm";
import { solutionInteractions } from "../db/schema/interactions";
import { solutions } from "../db/schema/solutions";
import type { DbClient } from "../types";

export interface InteractionStats {
  likes: number;
  dislikes: number;
  shares: number;
}

export interface UserInteractions {
  hasLiked: boolean;
  hasDisliked: boolean;
  hasShared: boolean;
}

export class InteractionsService {
  constructor(private db: DbClient) {}

  async toggleLike(solutionId: string, userId: string): Promise<boolean> {
    // Validar que la solución existe
    const solution = await this.db.query.solutions.findFirst({
      where: eq(solutions.id, solutionId),
    });
    if (!solution) throw new Error("Solution not found");

    const existingLike = await this.db.query.solutionInteractions.findFirst({
      where: and(
        eq(solutionInteractions.solutionId, solutionId),
        eq(solutionInteractions.userId, userId),
        eq(solutionInteractions.type, "like")
      ),
    });

    if (existingLike) {
      await this.db
        .delete(solutionInteractions)
        .where(eq(solutionInteractions.id, existingLike.id));
      return false;
    }

    // Si existe un dislike, lo eliminamos
    const existingDislike = await this.db.query.solutionInteractions.findFirst({
      where: and(
        eq(solutionInteractions.solutionId, solutionId),
        eq(solutionInteractions.userId, userId),
        eq(solutionInteractions.type, "dislike")
      ),
    });

    if (existingDislike) {
      await this.db
        .delete(solutionInteractions)
        .where(eq(solutionInteractions.id, existingDislike.id));
    }

    await this.db.insert(solutionInteractions).values({
      id: crypto.randomUUID(),
      solutionId,
      userId,
      type: "like",
      createdAt: new Date(),
      status: "active",
    });

    return true;
  }

  async toggleDislike(solutionId: string, userId: string): Promise<boolean> {
    // Validar que la solución existe
    const solution = await this.db.query.solutions.findFirst({
      where: eq(solutions.id, solutionId),
    });
    if (!solution) throw new Error("Solution not found");

    const existingDislike = await this.db.query.solutionInteractions.findFirst({
      where: and(
        eq(solutionInteractions.solutionId, solutionId),
        eq(solutionInteractions.userId, userId),
        eq(solutionInteractions.type, "dislike")
      ),
    });

    if (existingDislike) {
      await this.db
        .delete(solutionInteractions)
        .where(eq(solutionInteractions.id, existingDislike.id));
      return false;
    }

    // Si existe un like, lo eliminamos
    const existingLike = await this.db.query.solutionInteractions.findFirst({
      where: and(
        eq(solutionInteractions.solutionId, solutionId),
        eq(solutionInteractions.userId, userId),
        eq(solutionInteractions.type, "like")
      ),
    });

    if (existingLike) {
      await this.db
        .delete(solutionInteractions)
        .where(eq(solutionInteractions.id, existingLike.id));
    }

    await this.db.insert(solutionInteractions).values({
      id: crypto.randomUUID(),
      solutionId,
      userId,
      type: "dislike",
      createdAt: new Date(),
      status: "active",
    });

    return true;
  }

  async shareSolution(solutionId: string, userId: string) {
    const share = await this.db
      .insert(solutionInteractions)
      .values({
        id: crypto.randomUUID(),
        solutionId,
        userId,
        type: "share",
        createdAt: new Date(),
      })
      .returning();

    return share[0];
  }

  async getInteractionStats(solutionId: string): Promise<InteractionStats> {
    const stats = await this.db
      .select({
        likes: sql<number>`count(case when type = 'like' then 1 end)`,
        dislikes: sql<number>`count(case when type = 'dislike' then 1 end)`,
        shares: sql<number>`count(case when type = 'share' then 1 end)`,
      })
      .from(solutionInteractions)
      .where(eq(solutionInteractions.solutionId, solutionId))
      .get();

    return stats ?? { likes: 0, dislikes: 0, shares: 0 };
  }

  async getUserInteraction(
    solutionId: string,
    userId: string
  ): Promise<UserInteractions> {
    const interactions = await this.db.query.solutionInteractions.findMany({
      where: and(
        eq(solutionInteractions.solutionId, solutionId),
        eq(solutionInteractions.userId, userId)
      ),
    });

    return {
      hasLiked: interactions.some((i) => i.type === "like"),
      hasDisliked: interactions.some((i) => i.type === "dislike"),
      hasShared: interactions.some((i) => i.type === "share"),
    };
  }
}
