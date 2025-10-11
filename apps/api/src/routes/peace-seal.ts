import { Hono } from "hono";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";
import { PeaceSealController } from "../controllers/peace-seal.controller";
import { CommunityReviewsController } from "../controllers/community-reviews.controller";

const peaceSeal = new Hono();
const controller = new PeaceSealController();
const communityController = new CommunityReviewsController();

// Public routes (no authentication required)
peaceSeal.get("/directory", (c) => controller.directory(c));
peaceSeal.get("/directory/:slug", (c) => controller.getCompanyBySlug(c));
peaceSeal.post("/companies/:companyId/report", (c) =>
  controller.submitPublicReport(c)
);
peaceSeal.get("/reports/reasons", (c) => controller.getReportReasons(c));

// Community reviews routes (authentication required)
peaceSeal.use("/community/*", authMiddleware);
peaceSeal.use("/reviews", authMiddleware);
peaceSeal.post("/community/companies", (c) =>
  communityController.createOrFindCompany(c)
);
peaceSeal.get("/community/companies/search", (c) =>
  communityController.searchCompanies(c)
);
peaceSeal.post("/reviews", (c) => communityController.createReview(c));
peaceSeal.post("/reviews/verify/:token", (c) =>
  communityController.confirmVerification(c)
);
peaceSeal.post("/reviews/upload-document", (c) =>
  communityController.uploadVerificationDocument(c)
);
peaceSeal.get("/companies/:id/reviews", (c) =>
  communityController.listCompanyReviews(c)
);
peaceSeal.use("/my-reviews", authMiddleware);
peaceSeal.get("/my-reviews", (c) => communityController.getMyReviews(c));

// Applicant routes (authentication required)
peaceSeal.use("/applications/*", authMiddleware);
peaceSeal.post("/applications", (c) => controller.startApplication(c));
peaceSeal.get("/applications/me", (c) => controller.getMyApplications(c));

// User company routes (authentication required)
peaceSeal.use("/my-company", authMiddleware);
peaceSeal.get("/my-company", (c) => controller.getMyCompany(c));

peaceSeal.use("/companies/:companyId/questionnaire", authMiddleware);
peaceSeal.get("/companies/:companyId/questionnaire", (c) =>
  controller.getCompanyQuestionnaire(c)
);
peaceSeal.post("/applications/:id/confirm-payment", (c) =>
  controller.confirmPayment(c)
);
peaceSeal.post("/applications/:id/questionnaire/save", (c) =>
  controller.saveQuestionnaire(c)
);
peaceSeal.post("/applications/:id/questionnaire/validate", (c) =>
  controller.validateQuestionnaire(c)
);

// Document routes for applications (already covered by /applications/* middleware)
peaceSeal.get("/applications/:id/documents", (c) => controller.getDocuments(c));
peaceSeal.get("/applications/:id/documents/types-count", (c) =>
  controller.getDocumentTypesCount(c)
);
peaceSeal.post("/applications/:id/documents/check-requirements", (c) =>
  controller.checkDocumentRequirements(c)
);
peaceSeal.post("/applications/:id/documents", (c) =>
  controller.uploadApplicationDocument(c)
);

peaceSeal.post("/applications/:id/request-quote", (c) =>
  controller.requestQuote(c)
);

// Document management routes (authentication required)
peaceSeal.use("/documents/*", authMiddleware);
peaceSeal.post("/documents/:documentId/verify", (c) =>
  controller.verifyDocument(c)
);
peaceSeal.delete("/documents/:documentId", (c) => controller.deleteDocument(c));

// Admin/Advisor routes (authentication required)
peaceSeal.use("/admin/*", authMiddleware);
peaceSeal.get("/admin/companies", (c) => controller.adminListCompanies(c));
peaceSeal.get("/admin/companies/:id", (c) => controller.adminGetCompany(c));
peaceSeal.post("/admin/companies/:id/update", (c) => controller.adminUpdate(c));
peaceSeal.post("/admin/companies/:id/confirm-payment", (c) =>
  controller.adminConfirmPayment(c)
);
peaceSeal.post("/admin/companies/:id/score", (c) =>
  controller.advisorScoreQuestionnaire(c)
);
peaceSeal.get("/admin/statistics", (c) => controller.getStatistics(c));
peaceSeal.get("/admin/reports", (c) => controller.getReports(c));
peaceSeal.post("/admin/reports/:reportId/resolve", (c) =>
  controller.resolveReport(c)
);

// Admin community reviews routes
peaceSeal.get("/admin/reviews", (c) => communityController.adminListReviews(c));
peaceSeal.get("/admin/reviews/:id", (c) =>
  communityController.adminGetReviewDetails(c)
);
peaceSeal.post("/admin/reviews/:id/verify", (c) =>
  communityController.adminVerifyReview(c)
);

// System/cron routes (internal use)
peaceSeal.get("/system/check-expiring", (c) =>
  controller.checkExpiringCertifications(c)
);

// Webhook routes (no auth - validated internally)
peaceSeal.post("/webhooks/payment", (c) => controller.handlePaymentWebhook(c));

// Service routes for webhook processing (authenticated via service token)
peaceSeal.post("/webhooks/applications/:id/confirm-payment", (c) =>
  controller.confirmPaymentWebhook(c)
);

// Test route for R2 connectivity (development only)
if (process.env.NODE_ENV !== "production") {
  peaceSeal.get("/test/r2", (c) => controller.testR2Connection(c));
  peaceSeal.post("/test/formdata", (c) => controller.testFormData(c));
  peaceSeal.post("/test/auth-formdata", authMiddleware, (c) =>
    controller.testAuthFormData(c)
  );
}

export { peaceSeal as peaceSealRoutes };
