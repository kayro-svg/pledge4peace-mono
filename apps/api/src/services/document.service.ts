import { eq, and, desc } from "drizzle-orm";
import {
  peaceSealDocuments,
  peaceSealCompanies,
} from "../db/schema/peace-seal";
import type { DbClient } from "../types";
import { HTTPException } from "hono/http-exception";
import {
  DOCUMENT_TYPES,
  BUSINESS_RULES,
  isValidDocumentType,
  type DocumentType,
} from "../types/peace-seal";

export interface UploadDocumentDTO {
  companyId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  uploadedByUserId: string;
}

export interface DocumentFilters {
  companyId?: string;
  documentType?: string;
  verifiedOnly?: boolean;
}

export interface VerifyDocumentDTO {
  documentId: string;
  advisorUserId: string;
  verified: boolean;
}

// Use centralized constants
const ALLOWED_DOCUMENT_TYPES = Object.values(DOCUMENT_TYPES);
const MAX_FILE_SIZE = BUSINESS_RULES.MAX_FILE_SIZE_BYTES;

function now() {
  return Date.now(); // Return timestamp for D1 compatibility
}

export class DocumentService {
  constructor(private db: DbClient) {}

  // Upload document
  async uploadDocument(data: UploadDocumentDTO) {
    const {
      companyId,
      documentType,
      fileName,
      fileUrl,
      fileSize,
      uploadedByUserId,
    } = data;

    // Validate document type
    if (!isValidDocumentType(documentType)) {
      throw new HTTPException(400, {
        message: `Invalid document type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(", ")}`,
      });
    }

    // Validate file size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      throw new HTTPException(400, {
        message: `File size too large. Maximum allowed: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    // Verify company exists and user has permission
    await this.validateCompanyAccess(companyId, uploadedByUserId);

    // Create document record
    const document = await this.db
      .insert(peaceSealDocuments)
      .values({
        id: crypto.randomUUID(),
        companyId,
        documentType,
        fileName,
        fileUrl,
        fileSize: fileSize || null,
        uploadedByUserId,
        verifiedByAdvisor: 0,
        createdAt: now(),
      })
      .returning();

    return document[0];
  }

  // Get documents for a company
  async getDocuments(filters: DocumentFilters) {
    const { companyId, documentType, verifiedOnly } = filters;

    const where: any[] = [];
    if (companyId) where.push(eq(peaceSealDocuments.companyId, companyId));
    if (documentType)
      where.push(eq(peaceSealDocuments.documentType, documentType));
    if (verifiedOnly) where.push(eq(peaceSealDocuments.verifiedByAdvisor, 1));

    const documents = await this.db
      .select({
        id: peaceSealDocuments.id,
        companyId: peaceSealDocuments.companyId,
        documentType: peaceSealDocuments.documentType,
        fileName: peaceSealDocuments.fileName,
        fileUrl: peaceSealDocuments.fileUrl,
        fileSize: peaceSealDocuments.fileSize,
        uploadedByUserId: peaceSealDocuments.uploadedByUserId,
        verifiedByAdvisor: peaceSealDocuments.verifiedByAdvisor,
        createdAt: peaceSealDocuments.createdAt,
      })
      .from(peaceSealDocuments)
      .where(where.length ? (and as any)(...where) : undefined)
      .orderBy(desc(peaceSealDocuments.createdAt));

    return { items: documents };
  }

  // Verify document (advisor only)
  async verifyDocument(data: VerifyDocumentDTO) {
    const { documentId, advisorUserId, verified } = data;

    // Check if advisor has permission for this document's company
    const document = await this.db
      .select({
        id: peaceSealDocuments.id,
        companyId: peaceSealDocuments.companyId,
      })
      .from(peaceSealDocuments)
      .where(eq(peaceSealDocuments.id, documentId))
      .then((r) => r[0]);

    if (!document) {
      throw new HTTPException(404, { message: "Document not found" });
    }

    // Verify advisor is assigned to this company or is admin/superAdmin
    const company = await this.db
      .select({
        advisorUserId: peaceSealCompanies.advisorUserId,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, document.companyId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    // For now, we'll assume the caller has already verified advisor permissions
    // In a real implementation, you'd check user role and assignment

    await this.db
      .update(peaceSealDocuments)
      .set({
        verifiedByAdvisor: verified ? 1 : 0,
      })
      .where(eq(peaceSealDocuments.id, documentId));

    return { success: true };
  }

  // Delete document
  async deleteDocument(documentId: string, userId: string, userRole: string) {
    const document = await this.db
      .select()
      .from(peaceSealDocuments)
      .where(eq(peaceSealDocuments.id, documentId))
      .then((r) => r[0]);

    if (!document) {
      throw new HTTPException(404, { message: "Document not found" });
    }

    // Check permissions - owner or admin can delete
    const canDelete =
      document.uploadedByUserId === userId ||
      ["admin", "superAdmin"].includes(userRole);

    if (!canDelete) {
      throw new HTTPException(403, {
        message: "Not authorized to delete this document",
      });
    }

    await this.db
      .delete(peaceSealDocuments)
      .where(eq(peaceSealDocuments.id, documentId));

    return { success: true };
  }

  // Get document by ID (with permission check)
  async getDocumentById(documentId: string, userId: string, userRole: string) {
    const document = await this.db
      .select()
      .from(peaceSealDocuments)
      .where(eq(peaceSealDocuments.id, documentId))
      .then((r) => r[0]);

    if (!document) {
      throw new HTTPException(404, { message: "Document not found" });
    }

    // Check access permissions
    if (!["admin", "superAdmin", "advisor"].includes(userRole)) {
      // Regular users can only access their own company's documents
      await this.validateCompanyAccess(document.companyId, userId);
    }

    return document;
  }

  // Get document types with counts for a company
  async getDocumentTypesCounts(companyId: string) {
    const counts = await this.db
      .select({
        documentType: peaceSealDocuments.documentType,
        total: peaceSealDocuments.id, // This will be used for counting
        verified: peaceSealDocuments.verifiedByAdvisor,
      })
      .from(peaceSealDocuments)
      .where(eq(peaceSealDocuments.companyId, companyId));

    // Process counts
    const typeCounts: Record<string, { total: number; verified: number }> = {};

    counts.forEach((item) => {
      if (!typeCounts[item.documentType]) {
        typeCounts[item.documentType] = { total: 0, verified: 0 };
      }
      typeCounts[item.documentType].total++;
      if (item.verified) {
        typeCounts[item.documentType].verified++;
      }
    });

    return {
      typeCounts,
      recommendedTypes: this.getRecommendedDocumentTypes(),
    };
  }

  // Get recommended document types for questionnaire sections
  private getRecommendedDocumentTypes(): Record<string, string[]> {
    return {
      ethicalPractices: [
        "ethics_code",
        "governance_structure",
        "whistleblower_policy",
      ],
      peaceAlignedFinances: ["financial_audit", "annual_report"],
      supplyChain: ["supplier_code"],
      employeeRights: [
        "hr_handbook",
        "dei_policies",
        "conflict_resolution_policy",
      ],
      socialImpact: ["charitable_contributions", "annual_report"],
      environmentalResponsibility: ["environmental_report"],
      peaceCommitment: ["peace_statement", "annual_report"],
    };
  }

  // Validate that user has access to company documents
  private async validateCompanyAccess(companyId: string, userId: string) {
    const company = await this.db
      .select({
        createdByUserId: peaceSealCompanies.createdByUserId,
        advisorUserId: peaceSealCompanies.advisorUserId,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    // Check if user is owner or assigned advisor
    const hasAccess =
      company.createdByUserId === userId || company.advisorUserId === userId;

    if (!hasAccess) {
      throw new HTTPException(403, {
        message: "Not authorized to access this company's documents",
      });
    }

    return true;
  }

  // Check document requirements based on questionnaire responses
  async checkDocumentRequirements(companyId: string, responses: any) {
    const parsedResponses =
      typeof responses === "string" ? JSON.parse(responses) : responses;
    const requirements: Array<{
      documentType: string;
      reason: string;
      required: boolean;
      uploaded: boolean;
    }> = [];

    // Get existing documents for this company
    const existingDocs = await this.getDocuments({ companyId });
    const uploadedTypes = existingDocs.items.map((doc) => doc.documentType);

    // Check requirements based on responses
    if (parsedResponses.ethicsCode) {
      requirements.push({
        documentType: "ethics_code",
        reason: "Ethics code mentioned in questionnaire",
        required: true,
        uploaded: uploadedTypes.includes("ethics_code"),
      });
    }

    if (parsedResponses.auditedFinancials) {
      requirements.push({
        documentType: "financial_audit",
        reason: "Financial audit mentioned in questionnaire",
        required: true,
        uploaded: uploadedTypes.includes("financial_audit"),
      });
    }

    if (parsedResponses.deiPolicies) {
      requirements.push({
        documentType: "dei_policies",
        reason: "DEI policies mentioned in questionnaire",
        required: true,
        uploaded: uploadedTypes.includes("dei_policies"),
      });
    }

    // Add more requirements based on responses...

    return { requirements };
  }
}
