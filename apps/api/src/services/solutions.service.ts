import { eq, and } from "drizzle-orm";
import { solutions } from "../db/schema/solutions";
import { solutionInteractions } from "../db/schema/interactions";
import { comments } from "../db/schema/comments";
import type { DbClient } from "../types";

export interface CreateSolutionDTO {
  campaignId: string;
  userId: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface SolutionStats {
  likes: number;
  shares: number;
  comments: number;
}

type Solution = typeof solutions.$inferSelect;

export interface SolutionWithStats extends Solution {
  stats: SolutionStats;
}

export class SolutionsService {
  constructor(private db: DbClient) {}

  async createSolution(data: CreateSolutionDTO) {
    const newSolution = await this.db
      .insert(solutions)
      .values({
        id: crypto.randomUUID(),
        campaignId: data.campaignId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      })
      .returning();

    return newSolution[0];
  }

  async getSolutionsByCampaign(
    campaignId: string
  ): Promise<SolutionWithStats[]> {
    const solutionsData = await this.db.query.solutions.findMany({
      where: eq(solutions.campaignId, campaignId),
    });

    const solutionsWithStats = await Promise.all(
      solutionsData.map(async (solution) => {
        const stats = await this.getSolutionStats(solution.id);
        return {
          ...solution,
          stats,
        };
      })
    );

    return solutionsWithStats;
  }

  async getSolutionById(id: string): Promise<SolutionWithStats | null> {
    const solution = await this.db.query.solutions.findFirst({
      where: eq(solutions.id, id),
    });

    if (!solution) return null;

    const stats = await this.getSolutionStats(id);
    return {
      ...solution,
      stats,
    };
  }

  private async getSolutionStats(solutionId: string): Promise<SolutionStats> {
    const [likes, shares, commentCount] = await Promise.all([
      this.db
        .select()
        .from(solutionInteractions)
        .where(
          and(
            eq(solutionInteractions.solutionId, solutionId),
            eq(solutionInteractions.type, "like")
          )
        )
        .then((res) => res.length),
      this.db
        .select()
        .from(solutionInteractions)
        .where(
          and(
            eq(solutionInteractions.solutionId, solutionId),
            eq(solutionInteractions.type, "share")
          )
        )
        .then((res) => res.length),
      this.db
        .select()
        .from(comments)
        .where(eq(comments.solutionId, solutionId))
        .then((res) => res.length),
    ]);

    return {
      likes,
      shares,
      comments: commentCount,
    };
  }

  async updateSolutionStatus(
    id: string,
    status: "draft" | "published" | "archived"
  ) {
    const updated = await this.db
      .update(solutions)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(solutions.id, id))
      .returning();

    return updated[0];
  }
}
