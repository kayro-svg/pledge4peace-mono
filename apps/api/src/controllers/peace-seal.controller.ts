import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { Context } from "hono";
import { PeaceSealService } from "../services/peace-seal.service";
import { DocumentService } from "../services/document.service";
import { ReportsService } from "../services/reports.service";
import { DocumentsController } from "./documents.controller";
import {
  peaceSealCompanies,
  peaceSealQuestionnaires,
} from "../db/schema/peace-seal";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";

export class PeaceSealController {
  // Public directory list with search/filter
  directory = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);

      const url = new URL(c.req.url);
      const filters = {
        q: url.searchParams.get("q") || undefined,
        country: url.searchParams.get("country") || undefined,
        status: url.searchParams.get("status") || undefined,
        page: parseInt(url.searchParams.get("page") || "1"),
        limit: parseInt(url.searchParams.get("limit") || "100"),
      };

      const result = await peaceSealService.getDirectory(filters);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching directory:", error);
      throw new HTTPException(500, { message: "Error fetching directory" });
    }
  };

  // Public company profile by slug
  getCompanyBySlug = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const slug = c.req.param("slug");

      const company = await peaceSealService.getCompanyBySlug(slug);
      return c.json({ company });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching company by slug:", error);
      throw new HTTPException(500, { message: "Error fetching company" });
    }
  };

  // Applicant: start application (auth required)
  startApplication = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const { name, country, website, industry, employeeCount } = await c.req
        .json()
        .catch(() => ({}));

      if (!name) {
        throw new HTTPException(400, { message: "Company name is required" });
      }

      const user = c.get("user");
      const application = await peaceSealService.createApplication({
        name,
        country,
        website,
        industry,
        employeeCount: employeeCount ? Number(employeeCount) : undefined,
        createdByUserId: user.id,
      });

      return c.json({ id: application.id, slug: application.slug });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error creating application:", error);
      throw new HTTPException(500, { message: "Error creating application" });
    }
  };

  // Applicant: confirm payment after Braintree sale
  confirmPayment = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const companyId = c.req.param("id");
      const { transactionId, amountCents } = await c.req
        .json()
        .catch(() => ({}));

      if (!transactionId || !amountCents) {
        throw new HTTPException(400, {
          message: "transactionId and amountCents required",
        });
      }

      const user = c.get("user");
      const result = await peaceSealService.confirmPayment(
        companyId,
        String(transactionId),
        Number(amountCents),
        user.id
      );

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error confirming payment:", error);
      throw new HTTPException(500, { message: "Error confirming payment" });
    }
  };

  // Applicant: save questionnaire incrementally
  saveQuestionnaire = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const companyId = c.req.param("id");
      const { responses, progress } = await c.req.json().catch(() => ({}));
      const user = c.get("user");

      const result = await peaceSealService.saveQuestionnaire({
        companyId,
        responses,
        progress: progress ? Number(progress) : 0,
        userId: user.id,
      });

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error saving questionnaire:", error);
      throw new HTTPException(500, { message: "Error saving questionnaire" });
    }
  };

  // Applicant: validate questionnaire
  validateQuestionnaire = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const { responses } = await c.req.json().catch(() => ({}));

      const validation = peaceSealService.validateQuestionnaire(responses);
      return c.json(validation);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error validating questionnaire:", error);
      throw new HTTPException(500, {
        message: "Error validating questionnaire",
      });
    }
  };

  // Applicant: list my applications
  getMyApplications = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const user = c.get("user");

      const result = await peaceSealService.getMyApplications(user.id);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching my applications:", error);
      throw new HTTPException(500, { message: "Error fetching applications" });
    }
  };

  // User: get my company
  getMyCompany = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const user = c.get("user");

      // Find company where this user is the creator
      const company = await db
        .select()
        .from(peaceSealCompanies)
        .where(eq(peaceSealCompanies.createdByUserId, user.id))
        .then((r) => r[0]);

      if (!company) {
        throw new HTTPException(404, {
          message: "No company associated with user",
        });
      }

      return c.json({ company });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching user company:", error);
      throw new HTTPException(500, { message: "Error fetching company" });
    }
  };

  // User: get company questionnaire
  getCompanyQuestionnaire = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const user = c.get("user");
      const companyId = c.req.param("companyId");

      // Check if user has access to this company
      // For regular users, verify they own the company; for advisors/admins, allow access
      if (!["advisor", "admin", "superAdmin"].includes(user.role || "")) {
        // For regular users, verify they created this company
        const company = await db
          .select({ createdByUserId: peaceSealCompanies.createdByUserId })
          .from(peaceSealCompanies)
          .where(eq(peaceSealCompanies.id, companyId))
          .then((r) => r[0]);

        if (!company || company.createdByUserId !== user.id) {
          throw new HTTPException(403, {
            message: "Access denied to this company",
          });
        }
      }

      const questionnaire = await db
        .select()
        .from(peaceSealQuestionnaires)
        .where(eq(peaceSealQuestionnaires.companyId, companyId))
        .then((r) => r[0]);

      if (!questionnaire) {
        throw new HTTPException(404, { message: "Questionnaire not found" });
      }

      return c.json(questionnaire);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching company questionnaire:", error);
      throw new HTTPException(500, { message: "Error fetching questionnaire" });
    }
  };

  // Admin/Advisor: list companies for management
  adminListCompanies = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const user = c.get("user");

      const url = new URL(c.req.url);
      const filters = {
        status: url.searchParams.get("status") || undefined,
        assignedToMe: url.searchParams.get("assignedToMe") === "true",
        page: Math.max(parseInt(url.searchParams.get("page") || "1"), 1),
        limit: Math.min(
          Math.max(parseInt(url.searchParams.get("limit") || "20"), 1),
          100
        ),
        userId: user.id,
        userRole: user.role,
      };

      const result = await peaceSealService.adminListCompanies(filters);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching admin companies:", error);
      throw new HTTPException(500, { message: "Error fetching companies" });
    }
  };

  // Admin/Advisor: get company details for management
  adminGetCompany = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const user = c.get("user");
      const companyId = c.req.param("id");

      const result = await peaceSealService.adminGetCompany(
        companyId,
        user.role
      );
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching admin company:", error);
      throw new HTTPException(500, {
        message: "Error fetching company details",
      });
    }
  };

  // Advisor: Manually score questionnaire after review
  advisorScoreQuestionnaire = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const companyId = c.req.param("id");
      const { manualScore, notes } = await c.req.json().catch(() => ({}));
      const user = c.get("user");

      // Validate manual score - it's now required
      if (
        typeof manualScore !== "number" ||
        manualScore < 0 ||
        manualScore > 100
      ) {
        throw new HTTPException(400, {
          message: "Manual score is required and must be between 0 and 100",
        });
      }

      const result = await peaceSealService.advisorScoreQuestionnaire(
        companyId,
        user.id,
        user.role,
        manualScore,
        notes
      );

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error scoring questionnaire:", error);
      throw new HTTPException(500, { message: "Error scoring questionnaire" });
    }
  };

  // Admin/Advisor: update status/score/notes/assign advisor
  adminUpdate = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const companyId = c.req.param("id");
      const { status, score, notes, advisorUserId } = await c.req
        .json()
        .catch(() => ({}));
      const user = c.get("user");

      const result = await peaceSealService.adminUpdate({
        companyId,
        status,
        score: typeof score === "number" ? score : undefined,
        notes,
        advisorUserId,
        changedByUserId: user.id,
      });

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error updating company:", error);
      throw new HTTPException(500, { message: "Error updating company" });
    }
  };

  // Document Management (Legacy - for JSON uploads with pre-uploaded files)
  // uploadDocument = async (c: Context) => {
  //   try {
  //     const db = createDb(c.env.DB);
  //     const documentService = new DocumentService(db);
  //     const companyId = c.req.param("id");
  //     const { documentType, fileName, fileUrl, fileSize } = await c.req
  //       .json()
  //       .catch(() => ({}));
  //     const user = c.get("user");

  //     if (!documentType || !fileName || !fileUrl) {
  //       throw new HTTPException(400, {
  //         message: "documentType, fileName, and fileUrl are required",
  //       });
  //     }

  //     const result = await documentService.uploadDocument({
  //       companyId,
  //       documentType,
  //       fileName,
  //       fileUrl,
  //       fileSize,
  //       uploadedByUserId: user.id,
  //     });

  //     return c.json(result);
  //   } catch (error) {
  //     if (error instanceof HTTPException) throw error;
  //     logger.error("Error uploading document:", error);
  //     throw new HTTPException(500, { message: "Error uploading document" });
  //   }
  // };

  // Get documents for a company
  getDocuments = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const documentService = new DocumentService(db);
      const companyId = c.req.param("id");
      const url = new URL(c.req.url);

      const filters = {
        companyId,
        documentType: url.searchParams.get("documentType") || undefined,
        verifiedOnly: url.searchParams.get("verifiedOnly") === "true",
      };

      const result = await documentService.getDocuments(filters);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching documents:", error);
      throw new HTTPException(500, { message: "Error fetching documents" });
    }
  };

  // Advisor: verify document
  verifyDocument = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const documentService = new DocumentService(db);
      const documentId = c.req.param("documentId");
      const { verified } = await c.req.json().catch(() => ({}));
      const user = c.get("user");

      // Check if user has advisor role or higher
      if (!["advisor", "admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      const result = await documentService.verifyDocument({
        documentId,
        advisorUserId: user.id,
        verified: Boolean(verified),
      });

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error verifying document:", error);
      throw new HTTPException(500, { message: "Error verifying document" });
    }
  };

  // Delete document
  deleteDocument = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const documentService = new DocumentService(db);
      const documentId = c.req.param("documentId");
      const user = c.get("user");

      const result = await documentService.deleteDocument(
        documentId,
        user.id,
        user.role
      );
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error deleting document:", error);
      throw new HTTPException(500, { message: "Error deleting document" });
    }
  };

  // Public: submit report about a company
  submitPublicReport = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const reportsService = new ReportsService(db);
      const {
        companyId,
        reporterEmail,
        reporterName,
        reason,
        description,
        evidence,
      } = await c.req.json().catch(() => ({}));

      if (!companyId || !reason) {
        throw new HTTPException(400, {
          message: "companyId and reason are required",
        });
      }

      const result = await reportsService.createReport({
        companyId,
        reporterEmail,
        reporterName,
        reason,
        description,
        evidence,
      });

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error submitting report:", error);
      throw new HTTPException(500, { message: "Error submitting report" });
    }
  };

  // Admin: get reports
  getReports = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const reportsService = new ReportsService(db);
      const user = c.get("user");

      const url = new URL(c.req.url);
      const filters = {
        companyId: url.searchParams.get("companyId") || undefined,
        status: url.searchParams.get("status") || undefined,
        page: parseInt(url.searchParams.get("page") || "1"),
        limit: parseInt(url.searchParams.get("limit") || "20"),
      };

      const result = await reportsService.getReports(filters, user.role);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching reports:", error);
      throw new HTTPException(500, { message: "Error fetching reports" });
    }
  };

  // Admin: resolve report
  resolveReport = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const reportsService = new ReportsService(db);
      const reportId = c.req.param("reportId");
      const { resolution, resolutionNotes } = await c.req
        .json()
        .catch(() => ({}));
      const user = c.get("user");

      // Check permissions
      if (!["admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      if (!resolution || !["resolved", "dismissed"].includes(resolution)) {
        throw new HTTPException(400, {
          message: "Valid resolution (resolved/dismissed) is required",
        });
      }

      const result = await reportsService.resolveReport({
        reportId,
        resolution,
        resolutionNotes,
        resolvedByUserId: user.id,
      });

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error resolving report:", error);
      throw new HTTPException(500, { message: "Error resolving report" });
    }
  };

  // Get report reasons
  getReportReasons = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const reportsService = new ReportsService(db);

      const reasons = reportsService.getReportReasons();
      return c.json({ reasons });
    } catch (error) {
      logger.error("Error fetching report reasons:", error);
      throw new HTTPException(500, {
        message: "Error fetching report reasons",
      });
    }
  };

  // Statistics and metrics
  getStatistics = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const reportsService = new ReportsService(db);
      const user = c.get("user");

      // Check permissions
      if (!["advisor", "admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, { message: "Insufficient permissions" });
      }

      const [peaceSealStats, reportStats] = await Promise.all([
        peaceSealService.getStatistics(),
        reportsService.getReportStatistics(),
      ]);

      return c.json({
        peaceSeal: peaceSealStats,
        reports: reportStats,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching statistics:", error);
      throw new HTTPException(500, { message: "Error fetching statistics" });
    }
  };

  // Check expiring certifications (for cron jobs)
  checkExpiringCertifications = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);

      const expiring = await peaceSealService.checkExpiringCertifications();

      // Here you would integrate with your email service to send reminders
      // For each expiring company, send renewal reminder
      for (const company of expiring) {
        try {
          // Send email reminder (integrate with your email service)
          logger.log(
            `Renewal reminder needed for company: ${company.name} (${company.id})`
          );

          // Mark as reminder sent
          await peaceSealService.markRenewalReminderSent(company.id);
        } catch (emailError) {
          logger.error(
            `Failed to send renewal reminder for company ${company.id}:`,
            emailError
          );
        }
      }

      return c.json({
        checked: expiring.length,
        reminders: expiring.map((c) => ({
          id: c.id,
          name: c.name,
          expiresAt: c.expiresAt,
        })),
      });
    } catch (error) {
      logger.error("Error checking expiring certifications:", error);
      throw new HTTPException(500, {
        message: "Error checking expiring certifications",
      });
    }
  };

  // Webhook for payment processing (Braintree)
  handlePaymentWebhook = async (c: Context) => {
    try {
      const body = await c.req.json().catch(() => ({}));

      // Validate webhook signature (implement based on Braintree docs)
      // const signature = c.req.header("X-Braintree-Signature");
      // if (!this.validateWebhookSignature(body, signature)) {
      //   throw new HTTPException(401, { message: "Invalid webhook signature" });
      // }

      logger.log("Payment webhook received:", body);

      // Process the webhook event based on type
      if (body.kind === "transaction") {
        const transaction = body.transaction;

        if (transaction.status === "submitted_for_settlement") {
          // Payment was successful
          // Find the company by custom_fields or order_id and update payment status
          logger.log(`Payment confirmed for transaction: ${transaction.id}`);

          // You would implement the logic to match transaction to company
          // and call confirmPayment method
        }
      }

      return c.json({ received: true });
    } catch (error) {
      logger.error("Error processing payment webhook:", error);
      // Don't throw error for webhooks to avoid retries
      return c.json({ error: "Webhook processing failed" }, 500);
    }
  };

  // Confirm payment from webhook (service authentication)
  confirmPaymentWebhook = async (c: Context) => {
    try {
      // Validate service token
      const authHeader = c.req.header("Authorization");
      const serviceToken = c.env.WEBHOOK_AUTH_TOKEN; // Use environment from context

      logger.log("Webhook payment confirmation attempt:", {
        hasAuthHeader: !!authHeader,
        hasServiceToken: !!serviceToken,
        companyId: c.req.param("id"),
      });

      if (!serviceToken || authHeader !== `Bearer ${serviceToken}`) {
        logger.error("Invalid service token for webhook:", {
          expectedToken: serviceToken ? "present" : "missing",
          receivedAuth: authHeader ? "present" : "missing",
        });
        throw new HTTPException(401, { message: "Invalid service token" });
      }

      const db = createDb(c.env.DB);
      const peaceSealService = new PeaceSealService(db);
      const companyId = c.req.param("id");
      const { transactionId, amountCents, subscriptionId } = await c.req
        .json()
        .catch(() => ({}));

      if (!transactionId || !amountCents) {
        throw new HTTPException(400, {
          message: "transactionId and amountCents required",
        });
      }

      // Get company details to find the owner
      const company = await db
        .select({
          id: peaceSealCompanies.id,
          createdByUserId: peaceSealCompanies.createdByUserId,
          paymentStatus: peaceSealCompanies.paymentStatus,
        })
        .from(peaceSealCompanies)
        .where(eq(peaceSealCompanies.id, companyId))
        .then((r) => r[0]);

      if (!company) {
        throw new HTTPException(404, { message: "Company not found" });
      }

      // Call the service method using the company owner's ID
      const result = await peaceSealService.confirmPayment(
        companyId,
        String(transactionId),
        Number(amountCents),
        company.createdByUserId // Use company owner as the user
      );

      // If subscription was created, store the subscription ID
      if (subscriptionId) {
        await db
          .update(peaceSealCompanies)
          .set({
            // Store subscription ID in notes or a custom field
            notes: `Subscription ID: ${subscriptionId}`,
          })
          .where(eq(peaceSealCompanies.id, companyId));
      }

      logger.log("Webhook payment confirmation successful:", {
        companyId,
        transactionId,
        subscriptionId,
      });

      return c.json({ success: true, result });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error confirming webhook payment:", error);
      throw new HTTPException(500, { message: "Error confirming payment" });
    }
  };

  // Get document types and counts for a company
  getDocumentTypesCount = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const documentService = new DocumentService(db);
      const companyId = c.req.param("id");

      const result = await documentService.getDocumentTypesCounts(companyId);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching document types count:", error);
      throw new HTTPException(500, {
        message: "Error fetching document types count",
      });
    }
  };

  // Check document requirements based on questionnaire
  checkDocumentRequirements = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const documentService = new DocumentService(db);
      const companyId = c.req.param("id");
      const { responses } = await c.req.json().catch(() => ({}));

      const result = await documentService.checkDocumentRequirements(
        companyId,
        responses
      );
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error checking document requirements:", error);
      throw new HTTPException(500, {
        message: "Error checking document requirements",
      });
    }
  };

  // Upload document for application (with R2 integration)
  uploadApplicationDocument = async (c: Context) => {
    try {
      console.log("=== UPLOAD APPLICATION DOCUMENT CALLED ===");
      logger.log(
        "uploadApplicationDocument called with companyId:",
        c.req.param("id")
      );

      const db = createDb(c.env.DB);
      const user = c.get("user");
      const companyId = c.req.param("id");

      logger.log("User authenticated:", { userId: user?.id, companyId });

      // Verify that the user owns this application first
      const company = await db
        .select({
          createdByUserId: peaceSealCompanies.createdByUserId,
        })
        .from(peaceSealCompanies)
        .where(eq(peaceSealCompanies.id, companyId))
        .then((r) => r[0]);

      if (!company || company.createdByUserId !== user.id) {
        throw new HTTPException(403, { message: "Not authorized" });
      }

      // Now delegate to documents controller - it will handle the FormData and R2 upload
      const documentsController = new DocumentsController();
      return await documentsController.uploadDocument(c);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error uploading application document:", error);
      throw new HTTPException(500, { message: "Error uploading document" });
    }
  };

  // Test R2 connection (development only)
  testR2Connection = async (c: Context) => {
    try {
      logger.log("Testing R2 connection");

      const bucket = c.env.BUCKET;
      const environment = c.env.NODE_ENV;

      if (!bucket) {
        return c.json({
          success: false,
          error: "R2 bucket binding not found",
          environment,
        });
      }

      // Try to list objects (just to test connectivity)
      try {
        const testFileName = `test/connectivity-test-${Date.now()}.txt`;
        const testContent = "R2 connectivity test";

        // Upload a test file
        await bucket.put(testFileName, testContent, {
          httpMetadata: {
            contentType: "text/plain",
          },
        });

        logger.log("Test file uploaded successfully");

        // Try to read it back
        const testObject = await bucket.get(testFileName);

        if (testObject) {
          logger.log("Test file retrieved successfully");

          // Clean up test file
          await bucket.delete(testFileName);
          logger.log("Test file deleted successfully");

          return c.json({
            success: true,
            message: "R2 connection successful",
            environment,
            bucketName:
              environment === "production" ? "prod-p4p-cdn" : "dev-p4p-cdn",
          });
        } else {
          return c.json({
            success: false,
            error: "Could not retrieve test file",
            environment,
          });
        }
      } catch (r2Error) {
        logger.error("R2 operation failed:", r2Error);
        return c.json({
          success: false,
          error: `R2 operation failed: ${r2Error instanceof Error ? r2Error.message : "Unknown error"}`,
          environment,
        });
      }
    } catch (error) {
      logger.error("Error testing R2 connection:", error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Test FormData parsing (development only)
  testFormData = async (c: Context) => {
    try {
      console.log("=== TEST FORMDATA CALLED ===");

      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      const companyId = formData.get("companyId") as string;

      console.log("FormData received:", {
        hasFile: !!file,
        fileName: file?.name,
        fileSize: file?.size,
        companyId,
      });

      return c.json({
        success: true,
        message: "FormData received successfully",
        hasFile: !!file,
        fileName: file?.name,
        fileSize: file?.size,
        companyId,
      });
    } catch (error) {
      console.error("Error in testFormData:", error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Test FormData parsing with auth (development only)
  testAuthFormData = async (c: Context) => {
    try {
      console.log("=== TEST AUTH FORMDATA CALLED ===");

      const user = c.get("user");
      console.log("User from auth middleware:", {
        userId: user?.id,
        userEmail: user?.email,
      });

      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      const companyId = formData.get("companyId") as string;

      console.log("FormData received with auth:", {
        hasFile: !!file,
        fileName: file?.name,
        fileSize: file?.size,
        companyId,
        userId: user?.id,
      });

      return c.json({
        success: true,
        message: "Authenticated FormData received successfully",
        hasFile: !!file,
        fileName: file?.name,
        fileSize: file?.size,
        companyId,
        userId: user?.id,
      });
    } catch (error) {
      console.error("Error in testAuthFormData:", error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
