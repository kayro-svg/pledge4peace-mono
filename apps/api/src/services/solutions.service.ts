import { eq, and, inArray, desc, sql } from "drizzle-orm";
import { solutions } from "../db/schema/solutions";
import { solutionInteractions } from "../db/schema/interactions";
import { comments } from "../db/schema/comments";
import { users } from "../db/schema/users";
import type { DbClient } from "../types";

export interface CreateSolutionDTO {
  campaignId: string;
  userId: string;
  title: string;
  description: string;
  partyId: string; // Cambió de enum fijo a string genérico
  metadata?: Record<string, any>;
  // New: Party limits information from CMS
  partyLimits?: Record<string, number>;
  status?: "draft" | "published" | "archived";
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

export interface PartySolutionCounts {
  total: number;
  [partySlug: string]: number;
}

export class SolutionsService {
  constructor(private db: DbClient) {}

  async createSolution(data: CreateSolutionDTO) {
    // Validate that partyId is within allowed parties for the campaign
    if (data.partyLimits && !data.partyLimits[data.partyId]) {
      throw new Error(`Invalid party ID "${data.partyId}" for this campaign`);
    }

    // Get the maximum limit for this specific party
    const partyMaxLimit = data.partyLimits?.[data.partyId] || 5; // Default to 5 if no limits provided (backward compatibility)

    // Check party-specific solution limit
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
      const hasMultipleParties =
        data.partyLimits && Object.keys(data.partyLimits).length > 1;
      const suggestion = hasMultipleParties ? " Please try another party." : "";
      throw new Error(
        `Maximum limit of ${partyMaxLimit} solutions for this party has been reached.${suggestion}`
      );
    }

    // Calculate total campaign limit as sum of all party limits
    const totalCampaignLimit = data.partyLimits
      ? Object.values(data.partyLimits).reduce((sum, limit) => sum + limit, 0)
      : 10; // Default to 10 if no limits provided (backward compatibility)

    // Check if the campaign has reached the total solution limit
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

    if (campaignSolutionCount >= totalCampaignLimit) {
      throw new Error(
        `This campaign has reached the maximum limit of ${totalCampaignLimit} solutions`
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
        status: data.status ?? "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      })
      .returning();

    return newSolution[0];
  }

  async getSolutionsForModeration(
    status: "draft" | "published" | "archived" = "draft",
    campaignId?: string,
    page: number = 1,
    limit: number = 10,
    q?: string
  ): Promise<{
    items: Array<{
      id: string;
      title: string;
      description: string;
      author: string;
      submittedAt: Date;
      status: "draft" | "published" | "archived";
      campaignId: string;
      partyId: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const whereConditions = [eq(solutions.status, status)] as any[];
    if (campaignId) {
      whereConditions.push(eq(solutions.campaignId, campaignId));
    }
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      whereConditions.push(
        sql`(${solutions.title} LIKE ${term} OR ${solutions.description} LIKE ${term})`
      );
    }

    // total count
    const totalRes = await this.db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(solutions)
      .where(and(...whereConditions));
    const total = totalRes[0]?.count || 0;

    // simple join to get author name with pagination
    const rows = await this.db
      .select({
        id: solutions.id,
        title: solutions.title,
        description: solutions.description,
        author: users.name,
        submittedAt: solutions.createdAt,
        status: solutions.status,
        campaignId: solutions.campaignId,
        partyId: solutions.partyId,
      })
      .from(solutions)
      .leftJoin(users, eq(users.id, solutions.userId))
      .where(and(...whereConditions))
      .orderBy(desc(solutions.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const items = rows.map((r) => ({
      ...r,
      author: r.author || "Unknown",
    }));

    return { items, total, page, limit };
  }

  async approveAllDrafts(campaignId?: string) {
    const whereConditions = [eq(solutions.status, "draft")] as any[];
    if (campaignId) {
      whereConditions.push(eq(solutions.campaignId, campaignId));
    }

    const updated = await this.db
      .update(solutions)
      .set({ status: "published", updatedAt: new Date() })
      .where(and(...whereConditions))
      .returning({
        id: solutions.id,
        userId: solutions.userId,
        title: solutions.title,
        campaignId: solutions.campaignId,
        metadata: solutions.metadata,
      });

    return updated;
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

  async updateSolution(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      partyId: string;
      metadata: Record<string, any> | null;
    }>
  ) {
    const updatePayload: any = { updatedAt: new Date() };
    if (typeof data.title === "string") updatePayload.title = data.title;
    if (typeof data.description === "string")
      updatePayload.description = data.description;
    if (typeof data.partyId === "string") updatePayload.partyId = data.partyId;
    if (data.metadata !== undefined)
      updatePayload.metadata = data.metadata
        ? JSON.stringify(data.metadata)
        : null;

    const updated = await this.db
      .update(solutions)
      .set(updatePayload)
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
    campaignId: string,
    partySlugs?: string[]
  ): Promise<PartySolutionCounts> {
    const allSolutions = await this.db
      .select()
      .from(solutions)
      .where(
        and(
          eq(solutions.campaignId, campaignId),
          eq(solutions.status, "published")
        )
      );

    const counts: PartySolutionCounts = { total: allSolutions.length };

    // Si se proporcionan party slugs, contar específicamente por cada uno
    if (partySlugs && partySlugs.length > 0) {
      partySlugs.forEach((slug) => {
        counts[slug] = allSolutions.filter((s) => s.partyId === slug).length;
      });
    } else {
      // Si no se proporcionan, contar todos los partyIds únicos
      const uniquePartyIds = [...new Set(allSolutions.map((s) => s.partyId))];
      uniquePartyIds.forEach((partyId) => {
        counts[partyId as string] = allSolutions.filter(
          (s) => s.partyId === partyId
        ).length;
      });
    }

    return counts;
  }
}
