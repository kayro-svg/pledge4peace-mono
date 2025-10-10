import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { Context } from "hono";
import { CommunityReviewsService } from "../services/community-reviews.service";
import { logger } from "../utils/logger";

export class CommunityReviewsController {
  // Create or find company for community listing
  createOrFindCompany = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(db);
      const user = c.get("user");

      // Check if user is authenticated
      if (!user) {
        throw new HTTPException(401, { message: "Authentication required" });
      }

      const { name, website, country, industry } = await c.req
        .json()
        .catch(() => ({}));

      if (!name) {
        throw new HTTPException(400, { message: "Company name is required" });
      }

      const company = await communityReviewsService.createOrFindCompany(
        {
          name,
          website,
          country,
          industry,
        },
        user.id
      );

      return c.json({ company });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error creating/finding company:", error);
      throw new HTTPException(500, {
        message: "Error creating/finding company",
      });
    }
  };

  // Search companies for community listing
  searchCompanies = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(db);
      const url = new URL(c.req.url);
      const query = url.searchParams.get("q") || "";
      const limit = parseInt(url.searchParams.get("limit") || "10");

      if (!query.trim()) {
        return c.json({ items: [] });
      }

      const companies = await communityReviewsService.searchCompanies(
        query,
        limit
      );
      return c.json({ items: companies });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error searching companies:", error);
      throw new HTTPException(500, { message: "Error searching companies" });
    }
  };

  // Create a review
  createReview = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(db);
      const user = c.get("user");

      // Check if user is authenticated
      if (!user) {
        throw new HTTPException(401, { message: "Authentication required" });
      }

      const {
        companyId,
        role,
        verificationMethod,
        reviewerName,
        reviewerEmail,
        signedDisclosure,
        answers,
      } = await c.req.json().catch(() => ({}));

      if (!companyId || !role || !signedDisclosure || !answers) {
        throw new HTTPException(400, {
          message:
            "companyId, role, signedDisclosure, and answers are required",
        });
      }

      if (!["employee", "customer", "investor", "supplier"].includes(role)) {
        throw new HTTPException(400, {
          message:
            "Invalid role. Must be employee, customer, investor, or supplier",
        });
      }

      const review = await communityReviewsService.createReview({
        companyId,
        role,
        verificationMethod,
        reviewerName,
        reviewerEmail,
        signedDisclosure: Boolean(signedDisclosure),
        answers,
      });

      return c.json({ review });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error creating review:", error);
      throw new HTTPException(500, { message: "Error creating review" });
    }
  };

  // Confirm email verification
  confirmVerification = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(db);
      const token = c.req.param("token");

      if (!token) {
        throw new HTTPException(400, { message: "Token is required" });
      }

      const result = await communityReviewsService.confirmVerification(token);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error confirming verification:", error);
      throw new HTTPException(500, {
        message: "Error confirming verification",
      });
    }
  };

  // List reviews for a company
  listCompanyReviews = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(db);
      const companyId = c.req.param("id");
      const url = new URL(c.req.url);

      const filters = {
        companyId,
        role: url.searchParams.get("role") || undefined,
        verifiedOnly: url.searchParams.get("verifiedOnly") === "true",
        page: parseInt(url.searchParams.get("page") || "1"),
        limit: parseInt(url.searchParams.get("limit") || "20"),
      };

      const result = await communityReviewsService.listCompanyReviews(filters);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error listing company reviews:", error);
      throw new HTTPException(500, { message: "Error listing reviews" });
    }
  };

  // Admin: List pending reviews for moderation
  adminListReviews = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(db);
      const user = c.get("user");

      // Check permissions
      if (!["admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      const url = new URL(c.req.url);
      const filters = {
        status: url.searchParams.get("status") || "pending",
        page: parseInt(url.searchParams.get("page") || "1"),
        limit: parseInt(url.searchParams.get("limit") || "20"),
      };

      const result = await communityReviewsService.adminListReviews(filters);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error listing admin reviews:", error);
      throw new HTTPException(500, { message: "Error listing reviews" });
    }
  };

  // Admin: Verify or dismiss review
  adminVerifyReview = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(db);
      const reviewId = c.req.param("id");
      const { action, notes } = await c.req.json().catch(() => ({}));
      const user = c.get("user");

      // Check permissions
      if (!["admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      if (!action || !["verify", "dismiss"].includes(action)) {
        throw new HTTPException(400, {
          message: "Valid action (verify/dismiss) is required",
        });
      }

      const result = await communityReviewsService.adminVerifyReview(
        reviewId,
        action,
        user.id,
        notes
      );

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error verifying review:", error);
      throw new HTTPException(500, { message: "Error verifying review" });
    }
  };
}
