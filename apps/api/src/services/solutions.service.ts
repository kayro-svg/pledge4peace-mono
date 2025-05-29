import { eq, and, inArray } from "drizzle-orm";
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
  dislikes: number;
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
      dislikes: 0,
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

  async getSolutionsStatsByCampaign(
    campaignId: string
  ): Promise<{ solutionId: string; stats: SolutionStats }[]> {
    // Obtener todas las soluciones de la campaña
    const solutionsData = await this.db.query.solutions.findMany({
      where: eq(solutions.campaignId, campaignId),
    });
    const solutionIds = solutionsData.map((s) => s.id);
    if (solutionIds.length === 0) return [];

    // Obtener todas las interacciones relevantes en una sola consulta
    const interactions = await this.db.query.solutionInteractions.findMany({
      where: inArray(solutionInteractions.solutionId, solutionIds),
    });

    // Obtener todos los comentarios relevantes en una sola consulta
    const allComments = await this.db.query.comments.findMany({
      where: inArray(comments.solutionId, solutionIds),
    });

    // Agrupar stats por solución
    const statsBySolution: Record<string, SolutionStats> = {};
    for (const id of solutionIds) {
      statsBySolution[id] = { likes: 0, dislikes: 0, shares: 0, comments: 0 };
    }
    for (const interaction of interactions) {
      if (!statsBySolution[interaction.solutionId]) continue;
      if (interaction.type === "like")
        statsBySolution[interaction.solutionId].likes++;
      if (interaction.type === "dislike")
        statsBySolution[interaction.solutionId].dislikes++;
      if (interaction.type === "share")
        statsBySolution[interaction.solutionId].shares++;
    }
    for (const comment of allComments) {
      if (!statsBySolution[comment.solutionId]) continue;
      statsBySolution[comment.solutionId].comments++;
    }
    return solutionIds.map((id) => ({
      solutionId: id,
      stats: statsBySolution[id],
    }));
  }
}
