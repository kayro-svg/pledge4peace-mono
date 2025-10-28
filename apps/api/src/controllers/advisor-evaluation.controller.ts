import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { Context } from "hono";
import { AdvisorEvaluationService } from "../services/advisor-evaluation.service";
import { logger } from "../utils/logger";

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

      // Check if user is a company user
      if (user.role !== "user" || !user.companyId) {
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
        if (user.role !== "user" || user.companyId !== companyId) {
          throw new HTTPException(403, { message: "Access denied" });
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
