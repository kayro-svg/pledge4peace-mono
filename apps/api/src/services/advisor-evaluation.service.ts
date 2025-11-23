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
import type { EmailService } from "./email.service";

function now() {
  return Date.now();
}

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
      .select({
        id: peaceSealReviewEvaluations.id,
        evaluationStatus: peaceSealReviewEvaluations.evaluationStatus,
      })
      .from(peaceSealReviewEvaluations)
      .where(eq(peaceSealReviewEvaluations.reviewId, reviewId))
      .then((r) => r[0]);

    const nowTs = Date.now();
    let evaluationId: string;
    let evaluation: any[];
    let isUpdate = false;

    if (existingEvaluation) {
      // Update existing evaluation
      isUpdate = true;
      evaluationId = existingEvaluation.id;

      // Calculate response deadline (30 days from now) if changing to requires_company_response
      const responseDeadline = nowTs + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      const updateData: any = {
        evaluationStatus,
        evaluationNotes: evaluationNotes || null,
        updatedAt: nowTs,
      };

      // Update deadline if changing to requires_company_response
      if (evaluationStatus === "requires_company_response") {
        updateData.companyResponseDeadline = responseDeadline;
      } else {
        // Clear deadline if changing away from requires_company_response
        // Check if previous status was requires_company_response
        const prevStatus = String(existingEvaluation.evaluationStatus);
        if (prevStatus === "requires_company_response") {
          updateData.companyResponseDeadline = null;
        }
      }

      evaluation = await this.db
        .update(peaceSealReviewEvaluations)
        .set(updateData)
        .where(eq(peaceSealReviewEvaluations.id, evaluationId))
        .returning();
    } else {
      // Create new evaluation
      evaluationId = crypto.randomUUID();

      // Calculate response deadline (30 days from now)
      const responseDeadline = nowTs + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      // Create evaluation
      evaluation = await this.db
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
    }

    // Update review verification status based on evaluation result
    let reviewVerificationStatus: "verified" | "unverified" | "pending" | null =
      null;
    let shouldRecalcAggregates = false;

    if (evaluationStatus === "valid") {
      // Valid evaluation means review is verified
      reviewVerificationStatus = "verified";
      shouldRecalcAggregates = true;
    } else if (evaluationStatus === "invalid") {
      // Invalid evaluation means review is unverified
      reviewVerificationStatus = "unverified";
    }
    // For "requires_company_response", keep current verification status

    // Update review verification status if needed
    if (reviewVerificationStatus !== null) {
      await this.db
        .update(peaceSealReviews)
        .set({
          verificationStatus: reviewVerificationStatus,
          verifiedAt: reviewVerificationStatus === "verified" ? nowTs : null,
          updatedAt: nowTs,
        })
        .where(eq(peaceSealReviews.id, reviewId));

      // Recalculate aggregates if review was verified
      if (shouldRecalcAggregates) {
        await this.recalcAggregates(review.companyId);
      }
    }

    // If evaluation requires company response, create or update issue
    // Email notification will be sent from controller with EmailService
    if (evaluationStatus === "requires_company_response") {
      // Check if issue already exists for this evaluation
      const existingIssue = await this.db
        .select({
          id: peaceSealCompanyIssues.id,
          status: peaceSealCompanyIssues.status,
        })
        .from(peaceSealCompanyIssues)
        .where(eq(peaceSealCompanyIssues.evaluationId, evaluationId))
        .then((r) => r[0]);

      if (existingIssue) {
        // Update existing issue - reactivate if it was resolved/dismissed
        if (
          existingIssue.status === "resolved" ||
          existingIssue.status === "dismissed"
        ) {
          await this.db
            .update(peaceSealCompanyIssues)
            .set({
              status: "active",
              severity: this.determineSeverity(
                review.totalScore,
                review.starRating
              ),
              updatedAt: nowTs,
            })
            .where(eq(peaceSealCompanyIssues.id, existingIssue.id));

          // Update company's unresolved issues count
          await this.updateCompanyIssuesCount(review.companyId);
        }
      } else {
        // Create new issue
        await this.createCompanyIssue({
          companyId: review.companyId,
          evaluationId,
          issueType: "review_complaint",
          severity: this.determineSeverity(
            review.totalScore,
            review.starRating
          ),
        });
      }

      // Update notification timestamps only if this is a new evaluation or if company wasn't notified before
      // Email notification will be sent from controller with EmailService
      const evaluationRecord = await this.db
        .select({
          companyNotifiedAt: peaceSealReviewEvaluations.companyNotifiedAt,
        })
        .from(peaceSealReviewEvaluations)
        .where(eq(peaceSealReviewEvaluations.id, evaluationId))
        .then((r) => r[0]);

      // Only update notification timestamps if this is a new evaluation or if changing to requires_company_response
      if (!isUpdate || !evaluationRecord?.companyNotifiedAt) {
        await this.db
          .update(peaceSealReviewEvaluations)
          .set({
            companyNotifiedAt: nowTs,
            updatedAt: nowTs,
          })
          .where(eq(peaceSealReviewEvaluations.id, evaluationId));

        await this.db
          .update(peaceSealCompanies)
          .set({
            lastIssueNotificationAt: nowTs,
            updatedAt: nowTs,
          })
          .where(eq(peaceSealCompanies.id, review.companyId));
      }
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
      // Set finalResolution based on evaluationStatus
      if (evaluationStatus === "resolved" || evaluationStatus === "dismissed") {
        updateData.finalResolution = evaluationStatus;
      }
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

    // Mark associated issue as pending_review
    const issue = await this.db
      .select({ id: peaceSealCompanyIssues.id })
      .from(peaceSealCompanyIssues)
      .where(eq(peaceSealCompanyIssues.evaluationId, evaluationId))
      .then((r) => r[0]);

    if (issue) {
      await this.updateIssueStatus(issue.id, "pending_review");
    }

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
        reviewExperienceDescription: peaceSealReviews.experienceDescription,
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
        companyResponseDeadline:
          peaceSealReviewEvaluations.companyResponseDeadline,
        companyRespondedAt: peaceSealReviewEvaluations.companyRespondedAt,
        finalResolution: peaceSealReviewEvaluations.finalResolution,
        // Review details
        reviewRole: peaceSealReviews.role,
        reviewTotalScore: peaceSealReviews.totalScore,
        reviewStarRating: peaceSealReviews.starRating,
        reviewExperienceDescription: peaceSealReviews.experienceDescription,
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
    // Check and update seal status (suspended/revoked) based on issue count
    await this.checkSealStatus(data.companyId);
  }

  // Approve or reject company response
  async approveCompanyResponse(
    evaluationId: string,
    action: "approve" | "reject",
    notes?: string
  ) {
    // Verify evaluation exists and has company response
    const evaluation = await this.db
      .select({
        id: peaceSealReviewEvaluations.id,
        companyResponse: peaceSealReviewEvaluations.companyResponse,
        reviewId: peaceSealReviewEvaluations.reviewId,
      })
      .from(peaceSealReviewEvaluations)
      .where(eq(peaceSealReviewEvaluations.id, evaluationId))
      .then((r) => r[0]);

    if (!evaluation) {
      throw new HTTPException(404, { message: "Evaluation not found" });
    }

    if (!evaluation.companyResponse) {
      throw new HTTPException(400, {
        message: "Evaluation does not have a company response",
      });
    }

    // Get associated issue
    const issue = await this.db
      .select({ id: peaceSealCompanyIssues.id })
      .from(peaceSealCompanyIssues)
      .where(eq(peaceSealCompanyIssues.evaluationId, evaluationId))
      .then((r) => r[0]);

    if (!issue) {
      throw new HTTPException(404, { message: "Issue not found" });
    }

    const nowTs = Date.now();

    if (action === "approve") {
      // Approve: mark issue as resolved and evaluation finalResolution as resolved
      await this.updateIssueStatus(issue.id, "resolved");
      await this.updateEvaluation({
        evaluationId,
        evaluationStatus: "resolved",
        finalResolutionNotes: notes,
      });
    } else {
      // Reject: mark issue as active (company can respond again)
      await this.updateIssueStatus(issue.id, "active");
      // Clear company response and reset evaluation status to requires_company_response
      await this.db
        .update(peaceSealReviewEvaluations)
        .set({
          companyResponse: null,
          companyRespondedAt: null,
          evaluationStatus: "requires_company_response",
          finalResolutionNotes: notes,
          updatedAt: nowTs,
        })
        .where(eq(peaceSealReviewEvaluations.id, evaluationId));
    }

    return { success: true };
  }

  // Update issue status (used for pending_review, resolved, dismissed)
  async updateIssueStatus(
    issueId: string,
    status: "pending_review" | "resolved" | "dismissed" | "active"
  ) {
    const nowTs = Date.now();

    const updateData: any = {
      status,
    };

    // Set resolvedAt only when resolving or dismissing
    if (status === "resolved" || status === "dismissed") {
      updateData.resolvedAt = nowTs;
    }

    await this.db
      .update(peaceSealCompanyIssues)
      .set(updateData)
      .where(eq(peaceSealCompanyIssues.id, issueId));

    // Get company ID to update count
    const issue = await this.db
      .select({ companyId: peaceSealCompanyIssues.companyId })
      .from(peaceSealCompanyIssues)
      .where(eq(peaceSealCompanyIssues.id, issueId))
      .then((r) => r[0]);

    if (issue) {
      await this.updateCompanyIssuesCount(issue.companyId);
      if (status === "resolved" || status === "dismissed") {
        await this.checkSealStatus(issue.companyId);
      }
    }
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
    // Count only active issues (exclude pending_review, resolved, dismissed)
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

  async notifyCompany(
    companyId: string,
    evaluationId: string,
    emailService: EmailService | null = null,
    baseUrl: string | null = null
  ) {
    const nowTs = Date.now();

    // Get company details
    const company = await this.db
      .select({
        id: peaceSealCompanies.id,
        name: peaceSealCompanies.name,
        createdByUserId: peaceSealCompanies.createdByUserId,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) {
      logger.error(`Company ${companyId} not found for notification`);
      return;
    }

    // Get evaluation details
    const evaluation = await this.db
      .select({
        id: peaceSealReviewEvaluations.id,
        evaluationNotes: peaceSealReviewEvaluations.evaluationNotes,
        companyResponseDeadline:
          peaceSealReviewEvaluations.companyResponseDeadline,
        reviewId: peaceSealReviewEvaluations.reviewId,
      })
      .from(peaceSealReviewEvaluations)
      .where(eq(peaceSealReviewEvaluations.id, evaluationId))
      .then((r) => r[0]);

    if (!evaluation) {
      logger.error(`Evaluation ${evaluationId} not found for notification`);
      return;
    }

    // Get review details
    const review = await this.db
      .select({
        id: peaceSealReviews.id,
        role: peaceSealReviews.role,
        totalScore: peaceSealReviews.totalScore,
        starRating: peaceSealReviews.starRating,
      })
      .from(peaceSealReviews)
      .where(eq(peaceSealReviews.id, evaluation.reviewId))
      .then((r) => r[0]);

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

    // Send email notification if EmailService is provided
    if (emailService && baseUrl && company.createdByUserId) {
      try {
        // Get company owner user details
        const companyOwner = await this.db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            notifyEmail: users.notifyEmail,
          })
          .from(users)
          .where(eq(users.id, company.createdByUserId))
          .then((r) => r[0]);

        if (
          companyOwner &&
          companyOwner.email &&
          Number(companyOwner.notifyEmail ?? 1) !== 0
        ) {
          const deadlineDate =
            evaluation.companyResponseDeadline ||
            nowTs + 30 * 24 * 60 * 60 * 1000; // Fallback to 30 days

          await emailService.sendCompanyIssueNotificationEmail(
            companyOwner.email,
            companyOwner.name,
            company.name,
            review?.role || "Unknown",
            review?.totalScore || null,
            review?.starRating || null,
            evaluation.evaluationNotes || null,
            deadlineDate,
            baseUrl
          );

          logger.log(
            `Company issue notification email sent to ${companyOwner.email} for company ${companyId}`
          );
        }
      } catch (emailError) {
        logger.error(
          `Failed to send company issue notification email for company ${companyId}:`,
          emailError
        );
        // Don't fail the notification if email fails
      }
    } else {
      logger.log(
        `Company ${companyId} notified about evaluation ${evaluationId} (email service not available)`
      );
    }
  }

  private determineSeverity(totalScore?: number, starRating?: number): string {
    if (!totalScore && !starRating) return "medium";

    const score = totalScore || (starRating ? starRating * 20 : 50);

    if (score >= 80) return "low";
    if (score >= 60) return "medium";
    if (score >= 40) return "high";
    return "critical";
  }

  // Recalculate company rating aggregates (same logic as CommunityReviewsService)
  private async recalcAggregates(companyId: string) {
    // Get all verified reviews
    const reviews = await this.db
      .select({
        role: peaceSealReviews.role,
        starRating: peaceSealReviews.starRating,
      })
      .from(peaceSealReviews)
      .where(
        and(
          eq(peaceSealReviews.companyId, companyId),
          eq(peaceSealReviews.verificationStatus, "verified")
        )
      );

    // Calculate employee rating
    const employeeReviews = reviews.filter((r) => r.role === "employee");
    const employeeRatingAvg =
      employeeReviews.length > 0
        ? Math.round(
            employeeReviews.reduce((sum, r) => sum + (r.starRating || 0), 0) /
              employeeReviews.length
          )
        : null;

    // Calculate overall rating
    const overallRatingAvg =
      reviews.length > 0
        ? Math.round(
            reviews.reduce((sum, r) => sum + (r.starRating || 0), 0) /
              reviews.length
          )
        : null;

    // Update company
    await this.db
      .update(peaceSealCompanies)
      .set({
        employeeRatingAvg,
        employeeRatingCount: employeeReviews.length,
        overallRatingAvg,
        overallRatingCount: reviews.length,
        updatedAt: now(),
      })
      .where(eq(peaceSealCompanies.id, companyId));

    return { success: true };
  }
}
