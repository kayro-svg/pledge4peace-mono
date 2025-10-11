import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const peaceSealCompanies = sqliteTable("peace_seal_companies", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  country: text("country"),
  website: text("website"),
  industry: text("industry"),
  employeeCount: integer("employee_count"),
  status: text("status").notNull().default("application_submitted"), // application_submitted|audit_in_progress|audit_completed|did_not_pass|under_review|conditional
  score: integer("score"), // 0-100
  lastReviewedAt: integer("last_reviewed_at", { mode: "timestamp" }),
  notes: text("notes"),
  advisorUserId: text("advisor_user_id").references(() => users.id),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending|paid|failed|refunded
  paymentAmountCents: integer("payment_amount_cents"),
  paymentTransactionId: text("payment_txn_id"),
  paymentDate: integer("payment_date", { mode: "timestamp" }),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  renewalReminderSent: integer("renewal_reminder_sent").notNull().default(0),
  rfqStatus: text("rfq_status"), // requested|quoted|accepted|rejected
  rfqRequestedAt: integer("rfq_requested_at", { mode: "timestamp" }),
  rfqQuotedAmountCents: integer("rfq_quoted_amount_cents"),
  communityListed: integer("community_listed").notNull().default(0), // 0|1
  employeeRatingAvg: integer("employee_rating_avg"), // 1-5 stars
  employeeRatingCount: integer("employee_rating_count").notNull().default(0),
  overallRatingAvg: integer("overall_rating_avg"), // 1-5 stars
  overallRatingCount: integer("overall_rating_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const peaceSealQuestionnaires = sqliteTable(
  "peace_seal_questionnaires",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => peaceSealCompanies.id),
    version: integer("version").notNull().default(1),
    responses: text("responses"), // JSON string
    progress: integer("progress").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  }
);

export const peaceSealStatusHistory = sqliteTable("peace_seal_status_history", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => peaceSealCompanies.id),
  status: text("status").notNull(),
  score: integer("score"),
  notes: text("notes"),
  changedByUserId: text("changed_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const peaceSealReports = sqliteTable("peace_seal_reports", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => peaceSealCompanies.id),
  reporterEmail: text("reporter_email"),
  reporterName: text("reporter_name"),
  reason: text("reason").notNull(),
  description: text("description"),
  evidence: text("evidence"), // URLs o documentos
  status: text("status").notNull().default("pending"), // pending|reviewing|resolved|dismissed
  resolvedByUserId: text("resolved_by_user_id").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

export const peaceSealDocuments = sqliteTable("peace_seal_documents", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => peaceSealCompanies.id),
  documentType: text("document_type").notNull(), // ethics_code, financial_audit, hr_handbook, etc.
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"), // Added for file type tracking
  sectionId: text("section_id"), // Added for questionnaire section tracking
  fieldId: text("field_id"), // Added for specific field tracking
  uploadedByUserId: text("uploaded_by_user_id").references(() => users.id),
  verifiedByAdvisor: integer("verified_by_advisor").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const peaceSealReviews = sqliteTable("peace_seal_reviews", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => peaceSealCompanies.id),
  userId: text("user_id").references(() => users.id), // Track which user created the review
  role: text("role").notNull(), // employee|customer|investor|supplier
  verificationStatus: text("verification_status").notNull().default("pending"), // pending|verified|unverified
  verificationMethod: text("verification_method"), // email|linkedin|document|receipt|none
  verificationDocumentUrl: text("verification_document_url"), // URL to uploaded verification document
  reviewerName: text("reviewer_name"), // Optional, stored but never exposed
  reviewerEmail: text("reviewer_email"), // Optional, stored but never exposed
  signedDisclosure: integer("signed_disclosure").notNull().default(0), // 0|1
  answers: text("answers"), // JSON string of all answers
  sectionScores: text("section_scores"), // JSON string of section scores
  totalScore: integer("total_score"), // 0-100
  starRating: integer("star_rating"), // 1-5
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
});

export const peaceSealReviewVerifications = sqliteTable(
  "peace_seal_review_verifications",
  {
    id: text("id").primaryKey(),
    reviewId: text("review_id")
      .notNull()
      .references(() => peaceSealReviews.id),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    consumedAt: integer("consumed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  }
);
