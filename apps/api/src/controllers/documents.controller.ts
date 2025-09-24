import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { Context } from "hono";
import { peaceSealDocuments } from "../db/schema/peace-seal";
import { eq, and } from "drizzle-orm";
import { logger } from "../utils/logger";

// Allowed file types and sizes
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface R2UploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export class DocumentsController {
  // Upload file to R2 and store metadata
  uploadDocument = async (c: Context) => {
    try {
      console.log("=== DOCUMENTS CONTROLLER UPLOAD CALLED ===");
      logger.log("DocumentsController.uploadDocument called");

      const db = createDb(c.env.DB);
      const user = c.get("user");

      logger.log("User in DocumentsController:", { userId: user?.id });

      // Get form data
      logger.log("Parsing FormData from request");
      const formData = await c.req.formData();

      const file = formData.get("file") as File;
      const companyId = formData.get("companyId") as string;
      const documentType = formData.get("documentType") as string;
      const sectionId = formData.get("sectionId") as string;
      const fieldId = formData.get("fieldId") as string;

      logger.log("FormData parsed:", {
        hasFile: !!file,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        companyId,
        documentType,
        sectionId,
        fieldId,
      });

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

      if (file.size > MAX_FILE_SIZE) {
        throw new HTTPException(400, {
          message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
        });
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new HTTPException(400, {
          message: `File type '${file.type}' not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
        });
      }

      // Additional validation for file name
      if (!file.name || file.name.trim() === "") {
        throw new HTTPException(400, {
          message: "File name is required",
        });
      }

      // Generate unique file path
      const timestamp = Date.now();
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `peace-seal/${companyId}/${sectionId}/${fieldId}/${timestamp}_${sanitizedName}`;

      // Upload to R2
      const uploadResult = await this.uploadToR2(c, fileName, file);

      if (!uploadResult.success) {
        throw new HTTPException(500, {
          message: uploadResult.error || "Failed to upload file to storage",
        });
      }

      // Store metadata in database
      const documentId = crypto.randomUUID();
      await db.insert(peaceSealDocuments).values({
        id: documentId,
        companyId,
        documentType,
        fileName: file.name,
        fileUrl: uploadResult.fileUrl!,
        fileSize: file.size,
        mimeType: file.type,
        sectionId,
        fieldId,
        uploadedByUserId: user.id,
        createdAt: new Date(),
      });

      logger.log("Document uploaded successfully:", {
        documentId,
        fileName: file.name,
        companyId,
        sectionId,
        fieldId,
      });

      return c.json({
        success: true,
        documentId,
        fileUrl: uploadResult.fileUrl,
        fileName: file.name,
        fileSize: file.size,
        documentType,
        sectionId,
        fieldId,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error uploading document:", error);
      throw new HTTPException(500, { message: "Error uploading document" });
    }
  };

  // Delete file from R2 and database
  deleteDocument = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const user = c.get("user");
      const documentId = c.req.param("id");

      // Get document details
      const document = await db
        .select()
        .from(peaceSealDocuments)
        .where(eq(peaceSealDocuments.id, documentId))
        .then((r) => r[0]);

      if (!document) {
        throw new HTTPException(404, { message: "Document not found" });
      }

      // Check if user owns the document (via company ownership)
      // This should be enhanced with proper authorization logic
      if (document.uploadedByUserId !== user.id) {
        throw new HTTPException(403, {
          message: "Not authorized to delete this document",
        });
      }

      // Extract file path from URL
      const filePath = this.extractFilePathFromUrl(document.fileUrl);

      // Delete from R2
      const deleteResult = await this.deleteFromR2(c, filePath);

      if (!deleteResult.success) {
        logger.error("Failed to delete file from R2:", deleteResult.error);
        // Continue with database deletion even if R2 deletion fails
      }

      // Delete from database
      await db
        .delete(peaceSealDocuments)
        .where(eq(peaceSealDocuments.id, documentId));

      logger.log("Document deleted successfully:", {
        documentId,
        fileName: document.fileName,
      });

      return c.json({ success: true });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error deleting document:", error);
      throw new HTTPException(500, { message: "Error deleting document" });
    }
  };

  // Get documents for a company
  getCompanyDocuments = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const user = c.get("user");
      const companyId = c.req.param("companyId");

      // TODO: Add proper authorization check to ensure user owns the company

      const documents = await db
        .select({
          id: peaceSealDocuments.id,
          documentType: peaceSealDocuments.documentType,
          fileName: peaceSealDocuments.fileName,
          fileUrl: peaceSealDocuments.fileUrl,
          fileSize: peaceSealDocuments.fileSize,
          sectionId: peaceSealDocuments.sectionId,
          fieldId: peaceSealDocuments.fieldId,
          createdAt: peaceSealDocuments.createdAt,
        })
        .from(peaceSealDocuments)
        .where(eq(peaceSealDocuments.companyId, companyId))
        .orderBy(peaceSealDocuments.createdAt);

      return c.json({ documents });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching company documents:", error);
      throw new HTTPException(500, { message: "Error fetching documents" });
    }
  };

  // Generate signed URL for document access
  getDocumentSignedUrl = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const user = c.get("user");
      const documentId = c.req.param("id");

      // Get document details
      const document = await db
        .select()
        .from(peaceSealDocuments)
        .where(eq(peaceSealDocuments.id, documentId))
        .then((r) => r[0]);

      if (!document) {
        throw new HTTPException(404, { message: "Document not found" });
      }

      // TODO: Add proper authorization check

      // Extract file path from URL
      const filePath = this.extractFilePathFromUrl(document.fileUrl);

      // Generate signed URL (valid for 1 hour)
      const signedUrl = await this.generateSignedUrl(c, filePath, 3600);

      return c.json({
        signedUrl,
        fileName: document.fileName,
        expiresIn: 3600,
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error generating signed URL:", error);
      throw new HTTPException(500, { message: "Error generating signed URL" });
    }
  };

  // Private helper methods
  private async uploadToR2(
    c: Context,
    fileName: string,
    file: File
  ): Promise<R2UploadResult> {
    try {
      const bucket = c.env.BUCKET; // R2 bucket binding

      logger.log("Starting R2 upload:", {
        fileName,
        fileSize: file.size,
        fileType: file.type,
        environment: c.env.NODE_ENV,
        bucketDomain: c.env.BUCKET_DOMAIN,
        hasBucketBinding: !!bucket,
      });

      if (!bucket) {
        logger.error("R2 bucket binding not found");
        return {
          success: false,
          error: "R2 bucket binding not configured",
        };
      }

      logger.log("R2 bucket binding found, converting file to ArrayBuffer");

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      logger.log("File converted to ArrayBuffer, uploading to R2:", {
        arrayBufferSize: arrayBuffer.byteLength,
      });

      // Upload to R2 directly (Workers handle timeouts natively)
      logger.log("Starting R2 upload");
      const uploadResult = await bucket.put(fileName, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
          cacheControl: "public, max-age=31536000", // 1 year
        },
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });
      logger.log("R2 upload completed successfully");

      if (!uploadResult) {
        logger.error("R2 upload failed: No result returned");
        return {
          success: false,
          error: "Upload failed: No result returned from R2",
        };
      }

      logger.log("R2 upload successful:", {
        fileName,
        key: uploadResult.key,
        size: uploadResult.size,
      });

      // Generate public URL using R2 dev subdomain
      // Use the BUCKET_DOMAIN from environment if available
      let fileUrl: string;

      if (c.env.BUCKET_DOMAIN) {
        fileUrl = `${c.env.BUCKET_DOMAIN}/${fileName}`;
        logger.log("Using BUCKET_DOMAIN for file URL:", { fileUrl });
      } else {
        // Fallback to direct R2 URL
        const accountId = "bdec34a480199f7fc92334295749f6aa";
        const bucketName =
          c.env.NODE_ENV === "production" ? "prod-p4p-cdn" : "dev-p4p-cdn";
        fileUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${fileName}`;
        logger.log("Using fallback R2 URL:", { fileUrl });
      }

      return {
        success: true,
        fileUrl,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("R2 upload error:", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        fileName,
        fileSize: file.size,
        errorType: error?.constructor?.name,
      });

      // Provide more specific error messages based on error type
      let userFriendlyError = "Failed to upload file to storage";
      if (errorMessage.includes("timeout")) {
        userFriendlyError = "Upload timeout - please try again";
      } else if (errorMessage.includes("network")) {
        userFriendlyError =
          "Network error during upload - please check your connection";
      } else if (errorMessage.includes("size")) {
        userFriendlyError = "File size exceeds limits";
      }

      return {
        success: false,
        error: userFriendlyError,
      };
    }
  }

  private async deleteFromR2(
    c: Context,
    filePath: string
  ): Promise<R2UploadResult> {
    try {
      const bucket = c.env.BUCKET;

      await bucket.delete(filePath);

      return { success: true };
    } catch (error) {
      logger.error("R2 delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown delete error",
      };
    }
  }

  private async generateSignedUrl(
    c: Context,
    filePath: string,
    expiresIn: number
  ): Promise<string> {
    try {
      const bucket = c.env.BUCKET;

      // Generate signed URL
      const signedUrl = await bucket.get(filePath, {
        range: { offset: 0, length: 1 }, // Just to generate URL, not actually download
      });

      // Note: This is a simplified approach. In production, you might want to implement
      // proper signed URLs with expiration using Cloudflare's API or Workers
      return `https://${bucket.name}.r2.cloudflarestorage.com/${filePath}`;
    } catch (error) {
      logger.error("Error generating signed URL:", error);
      throw error;
    }
  }

  private extractFilePathFromUrl(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      return url.pathname.substring(1); // Remove leading slash
    } catch (error) {
      // If URL parsing fails, assume it's already a file path
      return fileUrl;
    }
  }
}
