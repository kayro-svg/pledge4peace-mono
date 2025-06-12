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
  partyId: "israeli" | "palestinian";
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
    // Check if the campaign has reached the solution limit (10 solutions max total)
    const campaignSolutionCount = await this.db
      .select()
      .from(solutions)
      .where(
        and(
          eq(solutions.campaignId, data.campaignId),
          eq(solutions.status, "published") // Only count published solutions
        )
      )
      .then((rows) => rows.length);

    if (campaignSolutionCount >= 10) {
      throw new Error(
        "This campaign has reached the maximum limit of 10 solutions"
      );
    }

    // Check equitable distribution: max 5 solutions per party
    const partyMaxLimit = Math.floor(10 / 2); // 5 solutions per party
    const partySolutionCount = await this.db
      .select()
      .from(solutions)
      .where(
        and(
          eq(solutions.campaignId, data.campaignId),
          eq(solutions.partyId, data.partyId),
          eq(solutions.status, "published")
        )
      )
      .then((rows) => rows.length);

    if (partySolutionCount >= partyMaxLimit) {
      const partyLabel = data.partyId === "israeli" ? "Israeli" : "Palestinian";
      throw new Error(
        `Maximum limit of ${partyMaxLimit} solutions for ${partyLabel} perspective has been reached. Please try the other perspective.`
      );
    }

    const newSolution = await this.db
      .insert(solutions)
      .values({
        id: crypto.randomUUID(),
        campaignId: data.campaignId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        partyId: data.partyId,
        status: "published",
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
    // Filtrar solo solutions published (no incluir draft ni archived)
    const solutionsData = await this.db.query.solutions.findMany({
      where: and(
        eq(solutions.campaignId, campaignId),
        eq(solutions.status, "published")
      ),
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
      where: and(eq(solutions.id, id), eq(solutions.status, "published")),
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
            eq(solutionInteractions.type, "like"),
            eq(solutionInteractions.status, "active")
          )
        )
        .then((res) => res.length),
      this.db
        .select()
        .from(solutionInteractions)
        .where(
          and(
            eq(solutionInteractions.solutionId, solutionId),
            eq(solutionInteractions.type, "share"),
            eq(solutionInteractions.status, "active")
          )
        )
        .then((res) => res.length),
      this.db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.solutionId, solutionId),
            eq(comments.status, "active")
          )
        )
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
    // Obtener solo las solutions published de la campaña
    const solutionsData = await this.db.query.solutions.findMany({
      where: and(
        eq(solutions.campaignId, campaignId),
        eq(solutions.status, "published")
      ),
    });
    const solutionIds = solutionsData.map((s) => s.id);
    if (solutionIds.length === 0) return [];

    // Obtener solo las interacciones activas en una sola consulta
    const interactions = await this.db.query.solutionInteractions.findMany({
      where: and(
        inArray(solutionInteractions.solutionId, solutionIds),
        eq(solutionInteractions.status, "active")
      ),
    });

    // Obtener solo los comentarios activos en una sola consulta
    const allComments = await this.db.query.comments.findMany({
      where: and(
        inArray(comments.solutionId, solutionIds),
        eq(comments.status, "active")
      ),
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

  async getPartySolutionCounts(
    campaignId: string
  ): Promise<{ israeli: number; palestinian: number; total: number }> {
    const allSolutions = await this.db
      .select()
      .from(solutions)
      .where(
        and(
          eq(solutions.campaignId, campaignId),
          eq(solutions.status, "published")
        )
      );

    const counts = {
      israeli: allSolutions.filter((s) => s.partyId === "israeli").length,
      palestinian: allSolutions.filter((s) => s.partyId === "palestinian")
        .length,
      total: allSolutions.length,
    };

    return counts;
  }
}
