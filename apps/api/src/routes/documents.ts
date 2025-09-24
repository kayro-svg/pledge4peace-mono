import { Hono } from "hono";
import { DocumentsController } from "../controllers/documents.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const documents = new Hono();
const controller = new DocumentsController();

// Apply auth middleware to all routes
documents.use("*", authMiddleware);

// Upload document
documents.post("/upload", (c) => controller.uploadDocument(c));

// Delete document
documents.delete("/:id", (c) => controller.deleteDocument(c));

// Get company documents
documents.get("/company/:companyId", (c) => controller.getCompanyDocuments(c));

// Get signed URL for document access
documents.get("/:id/signed-url", (c) => controller.getDocumentSignedUrl(c));

export { documents };
