import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { Context } from "hono";
import { CommunityReviewsService } from "../services/community-reviews.service";
import { logger } from "../utils/logger";
import { DocumentsController } from "./documents.controller";

export class CommunityReviewsController {
  // Create or find company for community listing
  createOrFindCompany = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(
        db,
        // c.env.LINKEDIN_CLIENT_ID,
        c.env.EMAIL_SERVICE
      );
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
      const communityReviewsService = new CommunityReviewsService(
        db,
        // c.env.LINKEDIN_CLIENT_ID
        c.env.EMAIL_SERVICE
      );
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
      const communityReviewsService = new CommunityReviewsService(
        db,
        // c.env.LINKEDIN_CLIENT_ID
        c.env.EMAIL_SERVICE
      );
      const user = c.get("user");

      // Community reviews support anonymous submissions per requirements
      // If no user is authenticated, we'll create an anonymous review

      const {
        companyId,
        role,
        verificationMethod,
        reviewerName,
        reviewerEmail,
        signedDisclosure,
        answers,
        verificationDocumentUrl,
        experienceDescription,
        oidcIdToken,
        oidcAccessToken,
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
        userId: user?.id || null, // Allow null for anonymous reviews
        role,
        verificationMethod,
        reviewerName,
        reviewerEmail,
        signedDisclosure: Boolean(signedDisclosure),
        answers,
        verificationDocumentUrl,
        experienceDescription,
        oidcIdToken,
        oidcAccessToken,
      });

      return c.json({ review });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error creating review:", error);
      console.error("Detailed error:", error);
      throw new HTTPException(500, { message: "Error creating review" });
    }
  };

  // Confirm email verification
  confirmVerification = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(
        db,
        // c.env.LINKEDIN_CLIENT_ID
        c.env.EMAIL_SERVICE
      );
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
      const communityReviewsService = new CommunityReviewsService(
        db,
        // c.env.LINKEDIN_CLIENT_ID
        c.env.EMAIL_SERVICE
      );
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
      const communityReviewsService = new CommunityReviewsService(
        db,
        // c.env.LINKEDIN_CLIENT_ID
        c.env.EMAIL_SERVICE
      );
      const user = c.get("user");

      // Check permissions - allow advisors to list reviews for evaluation
      if (!["admin", "superAdmin", "advisor"].includes(user.role)) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      const url = new URL(c.req.url);
      const filters = {
        status: url.searchParams.get("status") || "all",
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

  // User: Get my reviews
  getMyReviews = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(
        db,
        // c.env.LINKEDIN_CLIENT_ID,
        c.env.EMAIL_SERVICE
      );
      const user = c.get("user");

      // Check if user is authenticated
      if (!user) {
        throw new HTTPException(401, { message: "Authentication required" });
      }

      const url = new URL(c.req.url);
      const filters = {
        page: parseInt(url.searchParams.get("page") || "1"),
        limit: parseInt(url.searchParams.get("limit") || "20"),
      };

      const result = await communityReviewsService.getUserReviews(
        user.id,
        filters
      );
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error getting user reviews:", error);
      throw new HTTPException(500, { message: "Error getting reviews" });
    }
  };

  // Admin: Get detailed review data for verification
  adminGetReviewDetails = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(
        db,
        // c.env.LINKEDIN_CLIENT_ID
        c.env.EMAIL_SERVICE
      );
      const reviewId = c.req.param("id");
      const user = c.get("user");

      // Check permissions - allow advisors to view review details for evaluation
      if (!["admin", "superAdmin", "advisor"].includes(user.role)) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      const review =
        await communityReviewsService.adminGetReviewDetails(reviewId);
      return c.json({ review });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error getting review details:", error);
      throw new HTTPException(500, { message: "Error getting review details" });
    }
  };

  // Admin: Verify or dismiss review
  adminVerifyReview = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const communityReviewsService = new CommunityReviewsService(
        db,
        // c.env.LINKEDIN_CLIENT_ID
        c.env.EMAIL_SERVICE
      );
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

  // Upload verification document for community review (no auth required)
  uploadVerificationDocument = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const documentsController = new DocumentsController();

      // Get form data
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      const companyId = formData.get("companyId") as string;
      const documentType = formData.get("documentType") as string;
      const sectionId = formData.get("sectionId") as string;
      const fieldId = formData.get("fieldId") as string;

      // Validate required fields
      if (!file || !companyId || !documentType || !sectionId || !fieldId) {
        throw new HTTPException(400, {
          message:
            "Missing required fields: file, companyId, documentType, sectionId, fieldId",
        });
      }

      // Validate file
      if (file.size === 0) {
        throw new HTTPException(400, {
          message: "Empty file not allowed",
        });
      }

      // Set a temporary user ID for community review documents
      // This allows the document upload to work without authentication
      // The uploadedByUserId will be set to null in the documents controller for anonymous uploads
      c.set("user", {
        id: "community-review-user",
        email: "community-review@example.com",
        name: "Community Review User",
        role: "user",
      });

      // Delegate to documents controller
      return await documentsController.uploadDocument(c);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error uploading verification document:", error);
      throw new HTTPException(500, {
        message: "Error uploading verification document",
      });
    }
  };
}
