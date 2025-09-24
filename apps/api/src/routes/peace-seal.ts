import { Hono } from "hono";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";
import { PeaceSealController } from "../controllers/peace-seal.controller";

const peaceSeal = new Hono();
const controller = new PeaceSealController();

// Public routes (no authentication required)
peaceSeal.get("/directory", (c) => controller.directory(c));
peaceSeal.get("/directory/:slug", (c) => controller.getCompanyBySlug(c));
peaceSeal.post("/companies/:companyId/report", (c) =>
  controller.submitPublicReport(c)
);
peaceSeal.get("/reports/reasons", (c) => controller.getReportReasons(c));

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
peaceSeal.post("/admin/companies/:id/score", (c) =>
  controller.advisorScoreQuestionnaire(c)
);
peaceSeal.get("/admin/statistics", (c) => controller.getStatistics(c));
peaceSeal.get("/admin/reports", (c) => controller.getReports(c));
peaceSeal.post("/admin/reports/:reportId/resolve", (c) =>
  controller.resolveReport(c)
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
