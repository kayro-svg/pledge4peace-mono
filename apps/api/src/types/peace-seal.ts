// Peace Seal Program Types and Constants
// Centralized validation and enum definitions

export const PEACE_SEAL_STATUS = {
  DRAFT: "draft", // Application created but payment not completed
  APPLICATION_SUBMITTED: "application_submitted",
  AUDIT_IN_PROGRESS: "audit_in_progress",
  VERIFIED: "verified", // Changed from audit_completed for clarity
  CONDITIONAL: "conditional",
  DID_NOT_PASS: "did_not_pass",
  UNDER_REVIEW: "under_review",
} as const;

export type PeaceSealStatus =
  (typeof PEACE_SEAL_STATUS)[keyof typeof PEACE_SEAL_STATUS];

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const DOCUMENT_TYPES = {
  ETHICS_CODE: "ethics_code",
  FINANCIAL_AUDIT: "financial_audit",
  HR_HANDBOOK: "hr_handbook",
  SUPPLIER_CODE: "supplier_code",
  GOVERNANCE_STRUCTURE: "governance_structure",
  ANNUAL_REPORT: "annual_report",
  DEI_POLICIES: "dei_policies",
  CONFLICT_RESOLUTION_POLICY: "conflict_resolution_policy",
  ENVIRONMENTAL_REPORT: "environmental_report",
  PEACE_STATEMENT: "peace_statement",
  CHARITABLE_CONTRIBUTIONS: "charitable_contributions",
  WHISTLEBLOWER_POLICY: "whistleblower_policy",
  OTHER: "other",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

export const REPORT_STATUS = {
  PENDING: "pending",
  REVIEWING: "reviewing",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const;

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

export const REPORT_REASONS = {
  FALSE_PEACE_CLAIMS: "false_peace_claims",
  MILITARY_INVESTMENTS: "military_investments",
  LABOR_VIOLATIONS: "labor_violations",
  ENVIRONMENTAL_VIOLATIONS: "environmental_violations",
  ETHICAL_VIOLATIONS: "ethical_violations",
  MISLEADING_INFORMATION: "misleading_information",
  CONFLICT_INVOLVEMENT: "conflict_involvement",
  HUMAN_RIGHTS_VIOLATIONS: "human_rights_violations",
  OTHER: "other",
} as const;

export type ReportReason = (typeof REPORT_REASONS)[keyof typeof REPORT_REASONS];

// Status transition rules
export const STATUS_TRANSITIONS: Record<PeaceSealStatus, PeaceSealStatus[]> = {
  [PEACE_SEAL_STATUS.DRAFT]: [
    PEACE_SEAL_STATUS.APPLICATION_SUBMITTED, // After questionnaire submission (progress 100)
  ],
  [PEACE_SEAL_STATUS.APPLICATION_SUBMITTED]: [
    PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS,
    PEACE_SEAL_STATUS.DID_NOT_PASS,
  ],
  [PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS]: [
    PEACE_SEAL_STATUS.VERIFIED,
    PEACE_SEAL_STATUS.CONDITIONAL,
    PEACE_SEAL_STATUS.DID_NOT_PASS,
    PEACE_SEAL_STATUS.UNDER_REVIEW,
  ],
  [PEACE_SEAL_STATUS.VERIFIED]: [
    PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS, // Allow re-audit if needed
    PEACE_SEAL_STATUS.UNDER_REVIEW,
    PEACE_SEAL_STATUS.CONDITIONAL,
    PEACE_SEAL_STATUS.DID_NOT_PASS,
  ],
  [PEACE_SEAL_STATUS.CONDITIONAL]: [
    PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS, // Allow re-audit for improvement
    PEACE_SEAL_STATUS.VERIFIED,
    PEACE_SEAL_STATUS.UNDER_REVIEW,
    PEACE_SEAL_STATUS.DID_NOT_PASS,
  ],
  [PEACE_SEAL_STATUS.DID_NOT_PASS]: [
    PEACE_SEAL_STATUS.APPLICATION_SUBMITTED, // After cooldown period
    PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS,
  ],
  [PEACE_SEAL_STATUS.UNDER_REVIEW]: [
    PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS, // Allow going back to in progress
    PEACE_SEAL_STATUS.VERIFIED,
    PEACE_SEAL_STATUS.CONDITIONAL,
    PEACE_SEAL_STATUS.DID_NOT_PASS,
  ],
};

// Score thresholds
export const SCORE_THRESHOLDS = {
  PASS: 75, // ≥75 = verified
  CONDITIONAL: 60, // 60-74 = conditional
  FAIL: 60, // <60 = did_not_pass
} as const;

// Business rules
export const BUSINESS_RULES = {
  // Payment amounts (in cents)
  PAYMENT_SMALL_COMPANY: 9900, // $99 for 1–20 employees
  PAYMENT_MEDIUM_COMPANY: 49900, // $499 for 21–50 employees
  EMPLOYEE_COUNT_THRESHOLD: 50,

  // Time periods
  CERTIFICATION_DURATION_DAYS: 365, // 1 year
  RENEWAL_REMINDER_DAYS: 30, // 30 days before expiry
  REAPPLICATION_COOLDOWN_DAYS: 90, // 3 months after rejection

  // Rate limiting
  REPORT_SPAM_WINDOW_DAYS: 7, // Max 1 report per company per week

  // File limits
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  MAX_DOCUMENTS_PER_COMPANY: 50,
} as const;

// Validation helpers
export function isValidStatus(status: string): status is PeaceSealStatus {
  return Object.values(PEACE_SEAL_STATUS).includes(status as PeaceSealStatus);
}

export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return Object.values(PAYMENT_STATUS).includes(status as PaymentStatus);
}

export function isValidDocumentType(type: string): type is DocumentType {
  return Object.values(DOCUMENT_TYPES).includes(type as DocumentType);
}

export function isValidReportReason(reason: string): reason is ReportReason {
  return Object.values(REPORT_REASONS).includes(reason as ReportReason);
}

export function isValidReportStatus(status: string): status is ReportStatus {
  return Object.values(REPORT_STATUS).includes(status as ReportStatus);
}

export function canTransitionStatus(
  from: PeaceSealStatus,
  to: PeaceSealStatus
): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) || false;
}

export function getStatusFromScore(score: number): PeaceSealStatus {
  if (score >= SCORE_THRESHOLDS.PASS) return PEACE_SEAL_STATUS.VERIFIED;
  if (score >= SCORE_THRESHOLDS.CONDITIONAL)
    return PEACE_SEAL_STATUS.CONDITIONAL;
  return PEACE_SEAL_STATUS.DID_NOT_PASS;
}

// Legacy helper retained for compatibility (maps to new tiers)
export function getPaymentAmount(employeeCount: number): number {
  return (
    getPaymentAmountByEmployees(employeeCount) ??
    BUSINESS_RULES.PAYMENT_MEDIUM_COMPANY
  );
}

// New helper: returns null for RFQ (>50 employees)
export function getPaymentAmountByEmployees(
  employeeCount: number | null | undefined
): number | null {
  if (!employeeCount || employeeCount <= 0) {
    // Fallback to small tier when not provided (conservative)
    return BUSINESS_RULES.PAYMENT_SMALL_COMPANY;
  }
  if (employeeCount <= 20) return BUSINESS_RULES.PAYMENT_SMALL_COMPANY;
  if (employeeCount <= 50) return BUSINESS_RULES.PAYMENT_MEDIUM_COMPANY;
  return null; // RFQ only
}

export function isEligibleForReapplication(rejectedAt: Date): boolean {
  const cooldownEnd = new Date(rejectedAt);
  cooldownEnd.setDate(
    cooldownEnd.getDate() + BUSINESS_RULES.REAPPLICATION_COOLDOWN_DAYS
  );
  return new Date() >= cooldownEnd;
}
