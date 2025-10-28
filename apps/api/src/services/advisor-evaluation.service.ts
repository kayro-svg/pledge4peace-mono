import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { Context } from "hono";
import { logger } from "../utils/logger";
import {
  peaceSealReviews,
  peaceSealReviewEvaluations,
  peaceSealCompanyIssues,
  peaceSealCompanies,
  peaceSealStatusHistory,
} from "../db/schema/peace-seal";
import { users } from "../db/schema/users";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface CreateEvaluationDTO {
  reviewId: string;
  advisorUserId: string;
  evaluationStatus: "valid" | "invalid" | "requires_company_response";
  evaluationNotes?: string;
}

export interface UpdateEvaluationDTO {
  evaluationId: string;
  evaluationStatus?:
    | "valid"
    | "invalid"
    | "requires_company_response"
    | "resolved"
    | "unresolved"
    | "dismissed";
  evaluationNotes?: string;
  companyResponse?: string;
  finalResolutionNotes?: string;
}

export interface CompanyResponseDTO {
  evaluationId: string;
  companyResponse: string;
  companyUserId: string;
}

export class AdvisorEvaluationService {
  constructor(private db: any) {}

  // Create evaluation for a review
  async createEvaluation(data: CreateEvaluationDTO) {
    const { reviewId, advisorUserId, evaluationStatus, evaluationNotes } = data;

    // Verify review exists
    const review = await this.db
      .select({
        id: peaceSealReviews.id,
        companyId: peaceSealReviews.companyId,
        role: peaceSealReviews.role,
        totalScore: peaceSealReviews.totalScore,
        starRating: peaceSealReviews.starRating,
      })
      .from(peaceSealReviews)
      .where(eq(peaceSealReviews.id, reviewId))
      .then((r) => r[0]);

    if (!review) {
      throw new HTTPException(404, { message: "Review not found" });
    }

    // Check if evaluation already exists
    const existingEvaluation = await this.db
      .select({ id: peaceSealReviewEvaluations.id })
      .from(peaceSealReviewEvaluations)
      .where(eq(peaceSealReviewEvaluations.reviewId, reviewId))
      .then((r) => r[0]);

    if (existingEvaluation) {
      throw new HTTPException(400, {
        message: "Evaluation already exists for this review",
      });
    }

    const nowTs = Date.now();
    const evaluationId = crypto.randomUUID();

    // Calculate response deadline (30 days from now)
    const responseDeadline = nowTs + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    // Create evaluation
    const evaluation = await this.db
      .insert(peaceSealReviewEvaluations)
      .values({
        id: evaluationId,
        reviewId,
        advisorUserId,
        evaluationStatus,
        evaluationNotes: evaluationNotes || null,
        companyResponseDeadline:
          evaluationStatus === "requires_company_response"
            ? responseDeadline
            : null,
        createdAt: nowTs,
        updatedAt: nowTs,
      })
      .returning();

    // If evaluation requires company response, create an issue and notify company
    if (evaluationStatus === "requires_company_response") {
      await this.createCompanyIssue({
        companyId: review.companyId,
        evaluationId,
        issueType: "review_complaint",
        severity: this.determineSeverity(review.totalScore, review.starRating),
      });

      await this.notifyCompany(review.companyId, evaluationId);
    }

    return evaluation[0];
  }

  // Update evaluation
  async updateEvaluation(data: UpdateEvaluationDTO) {
    const {
      evaluationId,
      evaluationStatus,
      evaluationNotes,
      companyResponse,
      finalResolutionNotes,
    } = data;

    const nowTs = Date.now();
    const updateData: any = {
      updatedAt: nowTs,
    };

    if (evaluationStatus) {
      updateData.evaluationStatus = evaluationStatus;
    }
    if (evaluationNotes !== undefined) {
      updateData.evaluationNotes = evaluationNotes;
    }
    if (companyResponse !== undefined) {
      updateData.companyResponse = companyResponse;
      updateData.companyRespondedAt = nowTs;
    }
    if (finalResolutionNotes !== undefined) {
      updateData.finalResolutionNotes = finalResolutionNotes;
    }

    const evaluation = await this.db
      .update(peaceSealReviewEvaluations)
      .set(updateData)
      .where(eq(peaceSealReviewEvaluations.id, evaluationId))
      .returning();

    if (!evaluation[0]) {
      throw new HTTPException(404, { message: "Evaluation not found" });
    }

    // If evaluation is resolved or dismissed, update company issues
    if (evaluationStatus === "resolved" || evaluationStatus === "dismissed") {
      await this.resolveCompanyIssue(evaluationId, evaluationStatus);
    }

    return evaluation[0];
  }

  // Company responds to evaluation
  async companyRespondToEvaluation(data: CompanyResponseDTO) {
    const { evaluationId, companyResponse, companyUserId } = data;

    // Verify evaluation exists and is awaiting response
    const evaluation = await this.db
      .select({
        id: peaceSealReviewEvaluations.id,
        evaluationStatus: peaceSealReviewEvaluations.evaluationStatus,
        companyResponseDeadline:
          peaceSealReviewEvaluations.companyResponseDeadline,
        reviewId: peaceSealReviewEvaluations.reviewId,
      })
      .from(peaceSealReviewEvaluations)
      .where(eq(peaceSealReviewEvaluations.id, evaluationId))
      .then((r) => r[0]);

    if (!evaluation) {
      throw new HTTPException(404, { message: "Evaluation not found" });
    }

    if (evaluation.evaluationStatus !== "requires_company_response") {
      throw new HTTPException(400, {
        message: "Evaluation is not awaiting company response",
      });
    }

    // Check if deadline has passed
    if (
      evaluation.companyResponseDeadline &&
      Date.now() > evaluation.companyResponseDeadline
    ) {
      throw new HTTPException(400, { message: "Response deadline has passed" });
    }

    // Update evaluation with company response
    const updatedEvaluation = await this.updateEvaluation({
      evaluationId,
      companyResponse,
    });

    return updatedEvaluation;
  }

  // Get evaluations for advisor
  async getEvaluationsForAdvisor(
    advisorUserId: string,
    filters: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const { status, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = this.db
      .select({
        id: peaceSealReviewEvaluations.id,
        reviewId: peaceSealReviewEvaluations.reviewId,
        evaluationStatus: peaceSealReviewEvaluations.evaluationStatus,
        evaluationNotes: peaceSealReviewEvaluations.evaluationNotes,
        companyNotifiedAt: peaceSealReviewEvaluations.companyNotifiedAt,
        companyResponseDeadline:
          peaceSealReviewEvaluations.companyResponseDeadline,
        companyResponse: peaceSealReviewEvaluations.companyResponse,
        companyRespondedAt: peaceSealReviewEvaluations.companyRespondedAt,
        finalResolution: peaceSealReviewEvaluations.finalResolution,
        finalResolutionNotes: peaceSealReviewEvaluations.finalResolutionNotes,
        createdAt: peaceSealReviewEvaluations.createdAt,
        updatedAt: peaceSealReviewEvaluations.updatedAt,
        // Review details
        reviewRole: peaceSealReviews.role,
        reviewTotalScore: peaceSealReviews.totalScore,
        reviewStarRating: peaceSealReviews.starRating,
        reviewCreatedAt: peaceSealReviews.createdAt,
        // Company details
        companyName: peaceSealCompanies.name,
        companyId: peaceSealCompanies.id,
        companyStatus: peaceSealCompanies.status,
        companySealStatus: peaceSealCompanies.sealStatus,
      })
      .from(peaceSealReviewEvaluations)
      .innerJoin(
        peaceSealReviews,
        eq(peaceSealReviewEvaluations.reviewId, peaceSealReviews.id)
      )
      .innerJoin(
        peaceSealCompanies,
        eq(peaceSealReviews.companyId, peaceSealCompanies.id)
      )
      .where(eq(peaceSealReviewEvaluations.advisorUserId, advisorUserId))
      .orderBy(desc(peaceSealReviewEvaluations.createdAt));

    if (status) {
      query = query.where(
        eq(peaceSealReviewEvaluations.evaluationStatus, status)
      );
    }

    const evaluations = await query.limit(limit).offset(offset);
    const total = await this.db
      .select({ count: count() })
      .from(peaceSealReviewEvaluations)
      .where(eq(peaceSealReviewEvaluations.advisorUserId, advisorUserId))
      .then((r) => r[0].count);

    return {
      items: evaluations,
      total,
      page,
      limit,
    };
  }

  // Get company issues
  async getCompanyIssues(companyId: string) {
    const issues = await this.db
      .select({
        id: peaceSealCompanyIssues.id,
        evaluationId: peaceSealCompanyIssues.evaluationId,
        issueType: peaceSealCompanyIssues.issueType,
        severity: peaceSealCompanyIssues.severity,
        status: peaceSealCompanyIssues.status,
        createdAt: peaceSealCompanyIssues.createdAt,
        resolvedAt: peaceSealCompanyIssues.resolvedAt,
        // Evaluation details
        evaluationStatus: peaceSealReviewEvaluations.evaluationStatus,
        evaluationNotes: peaceSealReviewEvaluations.evaluationNotes,
        companyResponse: peaceSealReviewEvaluations.companyResponse,
        companyRespondedAt: peaceSealReviewEvaluations.companyRespondedAt,
        finalResolution: peaceSealReviewEvaluations.finalResolution,
        // Review details
        reviewRole: peaceSealReviews.role,
        reviewTotalScore: peaceSealReviews.totalScore,
        reviewStarRating: peaceSealReviews.starRating,
      })
      .from(peaceSealCompanyIssues)
      .innerJoin(
        peaceSealReviewEvaluations,
        eq(peaceSealCompanyIssues.evaluationId, peaceSealReviewEvaluations.id)
      )
      .innerJoin(
        peaceSealReviews,
        eq(peaceSealReviewEvaluations.reviewId, peaceSealReviews.id)
      )
      .where(eq(peaceSealCompanyIssues.companyId, companyId))
      .orderBy(desc(peaceSealCompanyIssues.createdAt));

    return issues;
  }

  // Private helper methods
  private async createCompanyIssue(data: {
    companyId: string;
    evaluationId: string;
    issueType: string;
    severity: string;
  }) {
    const issueId = crypto.randomUUID();
    const nowTs = Date.now();

    await this.db.insert(peaceSealCompanyIssues).values({
      id: issueId,
      companyId: data.companyId,
      evaluationId: data.evaluationId,
      issueType: data.issueType,
      severity: data.severity,
      createdAt: nowTs,
    });

    // Update company's unresolved issues count
    await this.updateCompanyIssuesCount(data.companyId);
  }

  private async resolveCompanyIssue(evaluationId: string, resolution: string) {
    const nowTs = Date.now();

    await this.db
      .update(peaceSealCompanyIssues)
      .set({
        status: resolution === "resolved" ? "resolved" : "dismissed",
        resolvedAt: nowTs,
      })
      .where(eq(peaceSealCompanyIssues.evaluationId, evaluationId));

    // Get company ID to update count
    const issue = await this.db
      .select({ companyId: peaceSealCompanyIssues.companyId })
      .from(peaceSealCompanyIssues)
      .where(eq(peaceSealCompanyIssues.evaluationId, evaluationId))
      .then((r) => r[0]);

    if (issue) {
      await this.updateCompanyIssuesCount(issue.companyId);
      await this.checkSealStatus(issue.companyId);
    }
  }

  private async updateCompanyIssuesCount(companyId: string) {
    const unresolvedCount = await this.db
      .select({ count: count() })
      .from(peaceSealCompanyIssues)
      .where(
        and(
          eq(peaceSealCompanyIssues.companyId, companyId),
          eq(peaceSealCompanyIssues.status, "active")
        )
      )
      .then((r) => r[0].count);

    await this.db
      .update(peaceSealCompanies)
      .set({
        unresolvedIssuesCount: unresolvedCount,
        updatedAt: Date.now(),
      })
      .where(eq(peaceSealCompanies.id, companyId));
  }

  private async checkSealStatus(companyId: string) {
    const company = await this.db
      .select({
        id: peaceSealCompanies.id,
        name: peaceSealCompanies.name,
        status: peaceSealCompanies.status,
        sealStatus: peaceSealCompanies.sealStatus,
        unresolvedIssuesCount: peaceSealCompanies.unresolvedIssuesCount,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) return;

    const nowTs = Date.now();
    let newSealStatus = company.sealStatus;
    let statusChangeReason = "";

    // Check if company has more than 10 unresolved issues
    if (company.unresolvedIssuesCount > 10) {
      if (company.sealStatus === "active") {
        newSealStatus = "revoked";
        statusChangeReason =
          "Peace Seal revoked due to more than 10 unresolved issues";
      }
    } else if (company.unresolvedIssuesCount > 5) {
      if (company.sealStatus === "active") {
        newSealStatus = "suspended";
        statusChangeReason = "Peace Seal suspended due to unresolved issues";
      }
    } else if (company.unresolvedIssuesCount === 0) {
      if (company.sealStatus === "suspended") {
        newSealStatus = "active";
        statusChangeReason = "Peace Seal reactivated - all issues resolved";
      }
    }

    // Update seal status if changed
    if (newSealStatus !== company.sealStatus) {
      const updateData: any = {
        sealStatus: newSealStatus,
        updatedAt: nowTs,
      };

      if (newSealStatus === "suspended") {
        updateData.sealSuspendedAt = nowTs;
      } else if (newSealStatus === "revoked") {
        updateData.sealRevokedAt = nowTs;
      }

      await this.db
        .update(peaceSealCompanies)
        .set(updateData)
        .where(eq(peaceSealCompanies.id, companyId));

      // Record status change
      await this.db.insert(peaceSealStatusHistory).values({
        id: crypto.randomUUID(),
        companyId,
        status: newSealStatus,
        notes: statusChangeReason,
        changedByUserId: "system",
        createdAt: nowTs,
      });

      logger.log(
        `Peace Seal status changed for ${company.name}: ${company.sealStatus} -> ${newSealStatus}`
      );
    }
  }

  private async notifyCompany(companyId: string, evaluationId: string) {
    const nowTs = Date.now();

    // Update evaluation with notification timestamp
    await this.db
      .update(peaceSealReviewEvaluations)
      .set({
        companyNotifiedAt: nowTs,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealReviewEvaluations.id, evaluationId));

    // Update company's last notification timestamp
    await this.db
      .update(peaceSealCompanies)
      .set({
        lastIssueNotificationAt: nowTs,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealCompanies.id, companyId));

    // TODO: Send email notification to company
    logger.log(
      `Company ${companyId} notified about evaluation ${evaluationId}`
    );
  }

  private determineSeverity(totalScore?: number, starRating?: number): string {
    if (!totalScore && !starRating) return "medium";

    const score = totalScore || (starRating ? starRating * 20 : 50);

    if (score >= 80) return "low";
    if (score >= 60) return "medium";
    if (score >= 40) return "high";
    return "critical";
  }
}
