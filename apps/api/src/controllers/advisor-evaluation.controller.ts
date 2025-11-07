import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { Context } from "hono";
import { AdvisorEvaluationService } from "../services/advisor-evaluation.service";
import { logger } from "../utils/logger";
import { EmailService } from "../services/email.service";
import {
  peaceSealReviews,
  peaceSealCompanies,
  peaceSealReviewEvaluations,
} from "../db/schema/peace-seal";
import { eq } from "drizzle-orm";

export class AdvisorEvaluationController {
  // Create evaluation for a review
  createEvaluation = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const advisorEvaluationService = new AdvisorEvaluationService(db);
      const user = c.get("user");

      // Check if user is advisor or above
      if (!["advisor", "admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, {
          message: "Only advisors can create evaluations",
        });
      }

      const { reviewId, evaluationStatus, evaluationNotes } = await c.req
        .json()
        .catch(() => ({}));

      if (!reviewId || !evaluationStatus) {
        throw new HTTPException(400, {
          message: "reviewId and evaluationStatus are required",
        });
      }

      if (
        !["valid", "invalid", "requires_company_response"].includes(
          evaluationStatus
        )
      ) {
        throw new HTTPException(400, {
          message:
            "Invalid evaluation status. Must be valid, invalid, or requires_company_response",
        });
      }

      const evaluation = await advisorEvaluationService.createEvaluation({
        reviewId,
        advisorUserId: user.id,
        evaluationStatus,
        evaluationNotes,
      });

      // If evaluation requires company response, send email notification
      if (evaluationStatus === "requires_company_response" && evaluation.id) {
        try {
          // Get company ID from review
          const db = createDb(c.env.DB);
          const review = await db
            .select({
              companyId: peaceSealReviews.companyId,
            })
            .from(peaceSealReviews)
            .where(eq(peaceSealReviews.id, reviewId))
            .then((r) => r[0]);

          if (review?.companyId) {
            // Create EmailService and send notification
            const emailService = new EmailService({
              apiKey: c.env.BREVO_API_KEY as string,
              fromEmail: c.env.BREVO_FROM_EMAIL as string,
              fromName: c.env.BREVO_FROM_NAME as string,
            });

            const baseUrl = c.env.BASE_URL || "https://www.pledge4peace.org";

            // Send email notification (non-blocking)
            advisorEvaluationService
              .notifyCompany(
                review.companyId,
                evaluation.id,
                emailService,
                baseUrl
              )
              .catch((emailError) => {
                logger.error(
                  "Failed to send company issue notification email:",
                  emailError
                );
                // Don't fail the request if email fails
              });
          }
        } catch (emailError) {
          logger.error(
            "Error setting up company issue notification email:",
            emailError
          );
          // Don't fail the request if email setup fails
        }
      }

      return c.json({ evaluation });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error creating evaluation:", error);
      throw new HTTPException(500, { message: "Error creating evaluation" });
    }
  };

  // Update evaluation
  updateEvaluation = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const advisorEvaluationService = new AdvisorEvaluationService(db);
      const user = c.get("user");

      // Check if user is advisor or above
      if (!["advisor", "admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, {
          message: "Only advisors can update evaluations",
        });
      }

      const evaluationId = c.req.param("id");
      const {
        evaluationStatus,
        evaluationNotes,
        companyResponse,
        finalResolutionNotes,
      } = await c.req.json().catch(() => ({}));

      if (!evaluationId) {
        throw new HTTPException(400, { message: "Evaluation ID is required" });
      }

      const evaluation = await advisorEvaluationService.updateEvaluation({
        evaluationId,
        evaluationStatus,
        evaluationNotes,
        companyResponse,
        finalResolutionNotes,
      });

      return c.json({ evaluation });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error updating evaluation:", error);
      throw new HTTPException(500, { message: "Error updating evaluation" });
    }
  };

  // Company responds to evaluation
  companyRespondToEvaluation = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const advisorEvaluationService = new AdvisorEvaluationService(db);
      const user = c.get("user");

      // Check if user is a regular user (company user)
      if (user.role !== "user") {
        throw new HTTPException(403, {
          message: "Only company users can respond to evaluations",
        });
      }

      const evaluationId = c.req.param("id");
      const { companyResponse } = await c.req.json().catch(() => ({}));

      if (!evaluationId || !companyResponse) {
        throw new HTTPException(400, {
          message: "evaluationId and companyResponse are required",
        });
      }

      // Verify the user owns the company associated with this evaluation
      const evaluationData = await db
        .select({
          evaluationId: peaceSealReviewEvaluations.id,
          reviewId: peaceSealReviewEvaluations.reviewId,
          companyId: peaceSealReviews.companyId,
          companyCreatedByUserId: peaceSealCompanies.createdByUserId,
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
        .where(eq(peaceSealReviewEvaluations.id, evaluationId))
        .then((r) => r[0]);

      if (!evaluationData) {
        throw new HTTPException(404, { message: "Evaluation not found" });
      }

      // Verify the user is the creator of the company
      if (evaluationData.companyCreatedByUserId !== user.id) {
        throw new HTTPException(403, {
          message: "You can only respond to evaluations for your own company",
        });
      }

      const evaluation =
        await advisorEvaluationService.companyRespondToEvaluation({
          evaluationId,
          companyResponse,
          companyUserId: user.id,
        });

      return c.json({ evaluation });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error processing company response:", error);
      throw new HTTPException(500, {
        message: "Error processing company response",
      });
    }
  };

  // Get evaluations for advisor
  getEvaluationsForAdvisor = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const advisorEvaluationService = new AdvisorEvaluationService(db);
      const user = c.get("user");

      // Check if user is advisor or above
      if (!["advisor", "admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, {
          message: "Only advisors can view evaluations",
        });
      }

      const url = new URL(c.req.url);
      const filters = {
        status: url.searchParams.get("status") || undefined,
        page: parseInt(url.searchParams.get("page") || "1"),
        limit: parseInt(url.searchParams.get("limit") || "20"),
      };

      const result = await advisorEvaluationService.getEvaluationsForAdvisor(
        user.id,
        filters
      );
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching evaluations:", error);
      throw new HTTPException(500, { message: "Error fetching evaluations" });
    }
  };

  // Get company issues
  getCompanyIssues = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const advisorEvaluationService = new AdvisorEvaluationService(db);
      const user = c.get("user");

      const companyId = c.req.param("companyId");

      // Check if user is advisor or above, or company owner
      if (!["advisor", "admin", "superAdmin"].includes(user.role)) {
        // For regular users, verify they own the company
        if (user.role !== "user") {
          throw new HTTPException(403, { message: "Access denied" });
        }

        // Verify the user is the creator of the company
        const company = await db
          .select({ createdByUserId: peaceSealCompanies.createdByUserId })
          .from(peaceSealCompanies)
          .where(eq(peaceSealCompanies.id, companyId))
          .then((r) => r[0]);

        if (!company || company.createdByUserId !== user.id) {
          throw new HTTPException(403, {
            message:
              "Access denied. You can only view issues for your own company.",
          });
        }
      }

      const issues = await advisorEvaluationService.getCompanyIssues(companyId);
      return c.json({ issues });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching company issues:", error);
      throw new HTTPException(500, {
        message: "Error fetching company issues",
      });
    }
  };

  // Approve or reject company response
  approveCompanyResponse = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const advisorEvaluationService = new AdvisorEvaluationService(db);
      const user = c.get("user");

      // Check if user is advisor or above
      if (!["advisor", "admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, {
          message: "Only advisors can approve or reject company responses",
        });
      }

      const evaluationId = c.req.param("id");
      const { action, notes } = await c.req.json().catch(() => ({}));

      if (!evaluationId || !action) {
        throw new HTTPException(400, {
          message: "evaluationId and action are required",
        });
      }

      if (!["approve", "reject"].includes(action)) {
        throw new HTTPException(400, {
          message: "Invalid action. Must be 'approve' or 'reject'",
        });
      }

      const result = await advisorEvaluationService.approveCompanyResponse(
        evaluationId,
        action,
        notes
      );

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error approving/rejecting company response:", error);
      throw new HTTPException(500, {
        message: "Error processing approval/rejection",
      });
    }
  };

  // Get evaluation details
  getEvaluationDetails = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const advisorEvaluationService = new AdvisorEvaluationService(db);
      const user = c.get("user");

      const evaluationId = c.req.param("id");

      // Check if user is advisor or above, or company owner
      if (!["advisor", "admin", "superAdmin"].includes(user.role)) {
        if (user.role !== "user" || !user.companyId) {
          throw new HTTPException(403, { message: "Access denied" });
        }
      }

      // TODO: Implement getEvaluationDetails method in service
      // For now, return a placeholder
      return c.json({
        message: "Evaluation details endpoint - to be implemented",
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching evaluation details:", error);
      throw new HTTPException(500, {
        message: "Error fetching evaluation details",
      });
    }
  };
}
