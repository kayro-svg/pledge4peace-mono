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
  badgeLevel: text("badge_level"), // bronze|silver|gold|null
  lastReviewedAt: integer("last_reviewed_at"),
  notes: text("notes"),
  advisorUserId: text("advisor_user_id").references(() => users.id),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending|paid|failed|refunded
  paymentAmountCents: integer("payment_amount_cents"),
  paymentTransactionId: text("payment_txn_id"),
  paymentDate: integer("payment_date"),
  verifiedAt: integer("verified_at"),
  expiresAt: integer("expires_at"),
  renewalReminderSent: integer("renewal_reminder_sent").notNull().default(0),
  renewalAmountCents: integer("renewal_amount_cents"), // Annual renewal fee
  renewalDueDate: integer("renewal_due_date"), // When renewal is due
  rfqStatus: text("rfq_status"), // requested|quoted|accepted|rejected
  rfqRequestedAt: integer("rfq_requested_at"),
  rfqQuotedAmountCents: integer("rfq_quoted_amount_cents"),
  communityListed: integer("community_listed").notNull().default(0), // 0|1
  employeeRatingAvg: integer("employee_rating_avg"), // 1-5 stars
  employeeRatingCount: integer("employee_rating_count").notNull().default(0),
  overallRatingAvg: integer("overall_rating_avg"), // 1-5 stars
  overallRatingCount: integer("overall_rating_count").notNull().default(0),
  unresolvedIssuesCount: integer("unresolved_issues_count")
    .notNull()
    .default(0),
  sealStatus: text("seal_status").notNull().default("active"), // active|suspended|revoked
  sealSuspendedAt: integer("seal_suspended_at"),
  sealRevokedAt: integer("seal_revoked_at"),
  lastIssueNotificationAt: integer("last_issue_notification_at"),
  // Peace Seal Center access
  peaceSealCenterAccess: integer("peace_seal_center_access")
    .notNull()
    .default(0), // 0|1
  digitalBadgeUrl: text("digital_badge_url"), // URL to downloadable badge
  physicalBadgeRequested: integer("physical_badge_requested")
    .notNull()
    .default(0), // 0|1
  physicalBadgeShipped: integer("physical_badge_shipped").notNull().default(0), // 0|1
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
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
    completedAt: integer("completed_at", {}),
    createdAt: integer("created_at", {}).notNull(),
    updatedAt: integer("updated_at", {}).notNull(),
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
  createdAt: integer("created_at", {}).notNull(),
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
  createdAt: integer("created_at", {}).notNull(),
  resolvedAt: integer("resolved_at", {}),
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
  uploadedByUserId: text("uploaded_by_user_id").references(() => users.id), // Can be null for anonymous community reviews
  verifiedByAdvisor: integer("verified_by_advisor").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export const peaceSealReviews = sqliteTable("peace_seal_reviews", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => peaceSealCompanies.id),
  userId: text("user_id").references(() => users.id), // Track which user created the review (can be null for anonymous reviews)
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
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  verifiedAt: integer("verified_at"),
  // Additional fields from existing table
  authorType: text("author_type").default("anonymous"), // anonymous|verified
  isVerifiedAuthor: integer("is_verified_author").default(0), // 0|1
  rating: integer("rating"), // 1-5 stars
  lowRatingReason: text("low_rating_reason"), // Reason for low rating
  evidenceUrl: text("evidence_url"), // URL to evidence
  isFlagged: integer("is_flagged").default(0), // 0|1
  experienceDescription: text("experience_description"), // Description of reviewer's experience
});

export const peaceSealReviewVerifications = sqliteTable(
  "peace_seal_review_verifications",
  {
    id: text("id").primaryKey(),
    reviewId: text("review_id")
      .notNull()
      .references(() => peaceSealReviews.id),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at").notNull(),
    consumedAt: integer("consumed_at"),
    createdAt: integer("created_at").notNull(),
  }
);

export const peaceSealReviewEvaluations = sqliteTable(
  "peace_seal_review_evaluations",
  {
    id: text("id").primaryKey(),
    reviewId: text("review_id")
      .notNull()
      .references(() => peaceSealReviews.id),
    advisorUserId: text("advisor_user_id")
      .notNull()
      .references(() => users.id),
    evaluationStatus: text("evaluation_status").notNull().default("pending"), // pending|valid|invalid|requires_company_response
    evaluationNotes: text("evaluation_notes"),
    companyNotifiedAt: integer("company_notified_at"),
    companyResponseDeadline: integer("company_response_deadline"),
    companyResponse: text("company_response"),
    companyRespondedAt: integer("company_responded_at"),
    finalResolution: text("final_resolution"), // resolved|unresolved|dismissed
    finalResolutionNotes: text("final_resolution_notes"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  }
);

export const peaceSealCompanyIssues = sqliteTable("peace_seal_company_issues", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => peaceSealCompanies.id),
  evaluationId: text("evaluation_id")
    .notNull()
    .references(() => peaceSealReviewEvaluations.id),
  issueType: text("issue_type").notNull(), // review_complaint|policy_violation|other
  severity: text("severity").notNull().default("medium"), // low|medium|high|critical
  status: text("status").notNull().default("active"), // active|resolved|dismissed
  createdAt: integer("created_at").notNull(),
  resolvedAt: integer("resolved_at"),
});

export const peaceSealRenewals = sqliteTable("peace_seal_renewals", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => peaceSealCompanies.id),
  renewalYear: integer("renewal_year").notNull(),
  amountCents: integer("amount_cents").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending|paid|failed|refunded
  paymentTransactionId: text("payment_transaction_id"),
  paymentDate: integer("payment_date"),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const peaceSealRewards = sqliteTable("peace_seal_rewards", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => peaceSealCompanies.id),
  rewardType: text("reward_type").notNull(), // digital_badge|physical_badge|certificate|brand_toolkit|network_access|survey_access
  status: text("status").notNull().default("pending"), // pending|delivered|used|expired
  deliveredAt: integer("delivered_at"),
  expiresAt: integer("expires_at"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const peaceSealCenterResources = sqliteTable(
  "peace_seal_center_resources",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    resourceType: text("resource_type").notNull(), // document|template|guide|tool|survey
    fileUrl: text("file_url"),
    category: text("category").notNull(), // hr_policies|supplier_codes|peace_statements|political_guidelines|compliance
    businessSize: text("business_size"), // small|medium|large|all
    isPublic: integer("is_public").notNull().default(0), // 0|1
    accessLevel: text("access_level").notNull().default("certified"), // certified|premium|all
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  }
);

export const peaceSealAgreementAcceptances = sqliteTable(
  "peace_seal_agreement_acceptances",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => peaceSealCompanies.id),
    sectionId: text("section_id").notNull(),
    fieldId: text("field_id").notNull(),
    templateId: text("template_id")
      .notNull()
      .references(() => peaceSealCenterResources.id),
    acceptedByUserId: text("accepted_by_user_id")
      .notNull()
      .references(() => users.id),
    acceptanceData: text("acceptance_data"), // JSON string for additional data like names/emails
    acceptedAt: integer("accepted_at").notNull(),
  }
);
