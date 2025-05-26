import { eq, and } from "drizzle-orm";
import { solutionInteractions } from "../db/schema/interactions";
import type { DbClient } from "../types";

export interface InteractionStats {
  likes: number;
  shares: number;
}

export interface UserInteractions {
  hasLiked: boolean;
  hasShared: boolean;
}

export class InteractionsService {
  constructor(private db: DbClient) {}

  async toggleLike(solutionId: string, userId: string): Promise<boolean> {
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

    await this.db.insert(solutionInteractions).values({
      id: crypto.randomUUID(),
      solutionId,
      userId,
      type: "like",
      createdAt: new Date(),
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
    const interactions = await this.db.query.solutionInteractions.findMany({
      where: eq(solutionInteractions.solutionId, solutionId),
    });

    return {
      likes: interactions.filter((i) => i.type === "like").length,
      shares: interactions.filter((i) => i.type === "share").length,
    };
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
      hasShared: interactions.some((i) => i.type === "share"),
    };
  }
}
