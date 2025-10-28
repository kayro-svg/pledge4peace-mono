import { apiClient } from "../api-client";
import type {
  AgreementAcceptance,
  TemplateResource,
  AcceptAgreementRequest,
} from "@/types/questionnaire";

export type DirectoryItem = {
  id: string;
  slug: string;
  name: string;
  country?: string | null;
  status: string;
  lastReviewedAt?: number | string | null;
  notes?: string | null;
  communityListed?: number | null;
  employeeRatingAvg?: number | null;
  employeeRatingCount?: number | null;
  overallRatingAvg?: number | null;
  overallRatingCount?: number | null;
};

export type Company = {
  id: string;
  slug: string;
  name: string;
  country?: string | null;
  website?: string | null;
  industry?: string | null;
  employeeCount?: number | null;
  status: string;
  score?: number | null;
  lastReviewedAt?: number | string | null;
  notes?: string | null;
  advisorUserId?: string | null;
  createdByUserId: string;
  paymentStatus: string;
  paymentAmountCents?: number | null;
  paymentTransactionId?: string | null;
  paymentDate?: number | string | null;
  rfqStatus?: string | null;
  rfqRequestedAt?: number | string | null;
  rfqQuotedAmountCents?: number | null;
  communityListed?: number | null;
  employeeRatingAvg?: number | null;
  employeeRatingCount?: number | null;
  overallRatingAvg?: number | null;
  overallRatingCount?: number | null;
  createdAt: number | string;
  updatedAt: number | string;
};

// Public endpoints (no auth required)
export async function listDirectory(params?: {
  q?: string;
  country?: string;
  status?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.country) qs.set("country", params.country);
  if (params?.status) qs.set("status", params.status);

  try {
    // Use apiClient for consistent URL handling (public endpoints don't need auth)
    const response = await apiClient.get<{ items: DirectoryItem[] }>(
      `/peace-seal/directory?${qs}`
    );
    return response.items;
  } catch (error) {
    console.error("Error fetching peace seal directory:", error);
    // Return empty array as fallback to prevent page crashes
    return [];
  }
}

export async function getCompanyBySlug(slug: string): Promise<Company> {
  try {
    // Use apiClient for consistent URL handling (public endpoints don't need auth)
    const response = await apiClient.get<{ company: Company }>(
      `/peace-seal/directory/${slug}`
    );
    return response.company;
  } catch (error) {
    console.error("Error fetching company by slug:", error);
    throw error; // Re-throw for proper error handling in components
  }
}

// Authenticated endpoints
export async function startApplication(data: {
  name: string;
  country?: string;
  website?: string;
  industry?: string;
  employeeCount?: number;
}) {
  return apiClient.post<{ id: string; slug: string }>(
    "/peace-seal/applications",
    data
  );
}

export async function requestQuote(id: string, employeeCount: number) {
  return apiClient.post<{ success: true }>(
    `/peace-seal/applications/${id}/request-quote`,
    { employeeCount }
  );
}

export async function confirmPayment(
  id: string,
  payload: {
    transactionId: string;
    amountCents: number;
  }
) {
  return apiClient.post<{ success: true }>(
    `/peace-seal/applications/${id}/confirm-payment`,
    payload
  );
}

export async function saveQuestionnaire(
  id: string,
  payload: {
    responses: Record<string, unknown>;
    progress: number;
  }
) {
  return apiClient.post<{ success: true }>(
    `/peace-seal/applications/${id}/questionnaire/save`,
    payload
  );
}

export async function myApplications() {
  return apiClient.get<{
    items: Array<{
      id: string;
      slug: string;
      name: string;
      status: string;
      paymentStatus: string;
    }>;
  }>("/peace-seal/applications/me");
}

// Admin/Advisor endpoints
export async function adminListCompanies(params?: {
  status?: string;
  assignedToMe?: boolean;
  communityListed?: boolean;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.assignedToMe) qs.set("assignedToMe", "true");
  if (params?.communityListed !== undefined)
    qs.set("communityListed", params.communityListed.toString());
  if (params?.page) qs.set("page", params.page.toString());
  if (params?.limit) qs.set("limit", params.limit.toString());

  const endpoint = `/peace-seal/admin/companies?${qs}`;
  return apiClient.get<{
    items: Array<{
      id: string;
      slug: string;
      name: string;
      country?: string;
      industry?: string;
      employeeCount?: number;
      status: string;
      score?: number;
      paymentStatus: string;
      paymentAmountCents?: number;
      createdAt: string;
      updatedAt: string;
      lastReviewedAt?: string;
      advisorUserId?: string;
      communityListed?: number;
      employeeRatingAvg?: number;
      employeeRatingCount?: number;
      overallRatingAvg?: number;
      overallRatingCount?: number;
    }>;
    page: number;
    limit: number;
    total: number;
  }>(endpoint);
}

export interface ParsedQuestionnaireResponse {
  fieldId: string;
  question: string;
  answer: unknown;
  section: string;
  isEmpty: boolean;
}

export interface ParsedQuestionnaireSection {
  sectionTitle: string;
  responses: ParsedQuestionnaireResponse[];
}

export interface QuestionnaireStats {
  totalQuestions: number;
  answeredQuestions: number;
  completionRate: number;
  sectionsCount: number;
}

export async function adminGetCompany(id: string) {
  return apiClient.get<{
    company: Company;
    questionnaire?: {
      id: string;
      progress: number;
      completedAt?: string;
      createdAt: string;
      updatedAt: string;
      sections: ParsedQuestionnaireSection[];
      stats: QuestionnaireStats;
    } | null;
    history: Array<{
      id: string;
      status: string;
      score?: number;
      notes?: string;
      createdAt: string;
      changedByUserId: string;
    }>;
    documents: Array<{
      id: string;
      documentType: string;
      fileName: string;
      fileUrl: string;
      fileSize?: number;
      mimeType?: string;
      sectionId?: string;
      fieldId?: string;
      uploadedByUserId?: string;
      verifiedByAdvisor: number;
      createdAt: string;
    }>;
  }>(`/peace-seal/admin/companies/${id}`);
}

export async function adminUpdateCompany(
  id: string,
  payload: {
    status?: string;
    score?: number;
    notes?: string;
    advisorUserId?: string;
  }
) {
  return apiClient.post<{ success: true }>(
    `/peace-seal/admin/companies/${id}/update`,
    payload
  );
}

export async function adminConfirmPayment(
  id: string,
  payload: {
    amountCents: number;
    transactionId?: string;
  }
) {
  return apiClient.post<{ success: true }>(
    `/peace-seal/admin/companies/${id}/confirm-payment`,
    payload
  );
}

// User company endpoints
export async function getUserCompany(): Promise<Company> {
  return apiClient
    .get<{ company: Company }>(`/peace-seal/my-company`)
    .then((response) => response.company);
}

export async function getCompanyQuestionnaire(companyId: string) {
  return apiClient.get<{
    id: string;
    progress: number;
    completedAt?: string;
    responses?: string;
    createdAt: string;
    updatedAt: string;
  }>(`/peace-seal/companies/${companyId}/questionnaire`);
}

export async function advisorScoreQuestionnaire(
  companyId: string,
  manualScore: number,
  notes?: string
) {
  return apiClient.post<{
    success: boolean;
    score: number;
    status: string;
    reviewedBy: string;
  }>(`/peace-seal/admin/companies/${companyId}/score`, {
    manualScore,
    notes,
  });
}

// Reports API functions
export interface ReportData {
  companyId: string;
  reporterEmail?: string;
  reporterName?: string;
  reason: string;
  description?: string;
  evidence?: string;
}

export interface Report {
  id: string;
  companyId: string;
  companyName: string;
  reporterEmail?: string;
  reporterName?: string;
  reason: string;
  description?: string;
  evidence?: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  resolutionNotes?: string;
  createdAt: string | number;
  resolvedAt?: string | number;
  resolvedByUserId?: string;
  resolverName?: string;
}

export interface ReportReasons {
  false_peace_claims: string;
  military_investments: string;
  labor_violations: string;
  environmental_violations: string;
  ethical_violations: string;
  misleading_information: string;
  conflict_involvement: string;
  human_rights_violations: string;
  other: string;
}

// Submit public report (no auth required)
export async function submitPublicReport(data: ReportData) {
  try {
    const response = await apiClient.post<Report>(
      `/peace-seal/companies/${data.companyId}/report`,
      data
    );
    return response;
  } catch (error) {
    console.error("Error submitting report:", error);
    throw error;
  }
}

// Get report reasons (no auth required)
export async function getReportReasons() {
  try {
    const response = await apiClient.get<{ reasons: ReportReasons }>(
      "/peace-seal/reports/reasons"
    );
    return response.reasons;
  } catch (error) {
    console.error("Error fetching report reasons:", error);
    throw error;
  }
}

// Get reports (admin/advisor only)
export async function getReports(params?: {
  companyId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.companyId) qs.set("companyId", params.companyId);
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", params.page.toString());
  if (params?.limit) qs.set("limit", params.limit.toString());

  try {
    const response = await apiClient.get<{
      items: Report[];
      page: number;
      limit: number;
      total: number;
    }>(`/peace-seal/admin/reports?${qs}`);
    return response;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

// Resolve report (admin only)
export async function resolveReport(
  reportId: string,
  resolution: "resolved" | "dismissed",
  resolutionNotes?: string
) {
  try {
    const response = await apiClient.post<{ success: boolean }>(
      `/peace-seal/admin/reports/${reportId}/resolve`,
      {
        resolution,
        resolutionNotes,
      }
    );
    return response;
  } catch (error) {
    console.error("Error resolving report:", error);
    throw error;
  }
}

// Helper function to get badge level from score
export function getBadgeLevel(
  score: number | null | undefined
): "Bronze" | "Silver" | "Gold" | null {
  if (!score || score < 70) return null;
  if (score >= 100) return "Gold";
  if (score >= 90) return "Silver";
  return "Bronze";
}

// Community Reviews Types
export type ReviewRole = "employee" | "customer" | "investor" | "supplier";
export type VerificationMethod =
  | "email"
  | "linkedin"
  | "document"
  | "receipt"
  | "none";
export type VerificationStatus = "pending" | "verified" | "unverified";

export type CommunityReview = {
  id: string;
  companyId: string; // Include companyId for filtering
  role: ReviewRole;
  verificationStatus: VerificationStatus;
  totalScore?: number | null;
  starRating?: number | null;
  createdAt: number | string;
  verifiedAt?: number | string | null;
  answers?: string; // JSON string of answers
  experienceDescription?: string | null;
};

export type CreateCompanyData = {
  name: string;
  website?: string;
  country?: string;
  industry?: string;
};

export type CreateReviewData = {
  companyId: string;
  role: ReviewRole;
  verificationMethod?: VerificationMethod;
  reviewerName?: string;
  reviewerEmail?: string;
  signedDisclosure: boolean;
  answers: Record<string, unknown>;
  verificationDocumentUrl?: string;
  experienceDescription?: string;
  oidcIdToken?: string;
  oidcAccessToken?: string;
};

// Community Reviews API Functions
export async function createOrFindCompany(data: CreateCompanyData) {
  return apiClient.post<{ company: Company }>(
    "/peace-seal/community/companies",
    data
  );
}

export async function searchCompanies(query: string, limit = 10) {
  return apiClient.get<{ items: Company[] }>(
    `/peace-seal/community/companies/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
}

export async function createReview(data: CreateReviewData) {
  return apiClient.post<{ review: CommunityReview }>(
    "/peace-seal/reviews",
    data
  );
}

export async function confirmVerification(token: string) {
  return apiClient.post<{ success: boolean }>(
    `/peace-seal/reviews/verify/${token}`
  );
}

export async function adminGetReviewDetails(reviewId: string) {
  return apiClient.get<{
    review: CommunityReview & {
      answers: Record<string, string>;
      sectionScores: Record<string, number>;
      companyName: string;
      reviewerName?: string;
      reviewerEmail?: string;
      verificationDocumentUrl?: string;
      signedDisclosure: boolean;
    };
  }>(`/peace-seal/admin/reviews/${reviewId}`);
}

export async function listCompanyReviews(
  companyId: string,
  filters?: {
    role?: string;
    verifiedOnly?: boolean;
    page?: number;
    limit?: number;
  }
) {
  const qs = new URLSearchParams();
  if (filters?.role) qs.set("role", filters.role);
  if (filters?.verifiedOnly) qs.set("verifiedOnly", "true");
  if (filters?.page) qs.set("page", filters.page.toString());
  if (filters?.limit) qs.set("limit", filters.limit.toString());

  return apiClient.get<{
    items: CommunityReview[];
    page: number;
    limit: number;
    total: number;
  }>(`/peace-seal/companies/${companyId}/reviews?${qs}`);
}

// User functions
export async function getMyReviews(filters?: {
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (filters?.page) qs.set("page", filters.page.toString());
  if (filters?.limit) qs.set("limit", filters.limit.toString());

  return apiClient.get<{
    items: Array<
      CommunityReview & {
        companyName?: string;
        companySlug?: string;
        companyCountry?: string;
        companyIndustry?: string;
      }
    >;
    page: number;
    limit: number;
    total: number;
  }>(`/peace-seal/my-reviews?${qs}`);
}

// Admin functions
export async function adminListReviews(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (filters?.status) qs.set("status", filters.status);
  if (filters?.page) qs.set("page", filters.page.toString());
  if (filters?.limit) qs.set("limit", filters.limit.toString());

  return apiClient.get<{
    items: Array<CommunityReview & { companyName?: string }>;
    page: number;
    limit: number;
    total: number;
  }>(`/peace-seal/admin/reviews?${qs}`);
}

export async function adminVerifyReview(
  reviewId: string,
  action: "verify" | "dismiss",
  notes?: string
) {
  return apiClient.post<{ success: boolean }>(
    `/peace-seal/admin/reviews/${reviewId}/verify`,
    {
      action,
      notes,
    }
  );
}

// Advisor Evaluation Types
export type EvaluationStatus =
  | "pending"
  | "valid"
  | "invalid"
  | "requires_company_response"
  | "resolved"
  | "unresolved"
  | "dismissed";
export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "active" | "resolved" | "dismissed";
export type SealStatus = "active" | "suspended" | "revoked";

export type ReviewEvaluation = {
  id: string;
  reviewId: string;
  advisorUserId: string;
  evaluationStatus: EvaluationStatus;
  evaluationNotes?: string;
  companyNotifiedAt?: number;
  companyResponseDeadline?: number;
  companyResponse?: string;
  companyRespondedAt?: number;
  finalResolution?: string;
  finalResolutionNotes?: string;
  createdAt: number;
  updatedAt: number;
  // Additional fields from joins
  reviewRole?: string;
  reviewTotalScore?: number;
  reviewStarRating?: number;
  reviewCreatedAt?: number;
  companyName?: string;
  companyId?: string;
  companyStatus?: string;
  companySealStatus?: SealStatus;
};

export type CompanyIssue = {
  id: string;
  evaluationId: string;
  issueType: string;
  severity: IssueSeverity;
  status: IssueStatus;
  createdAt: number;
  resolvedAt?: number;
  evaluationStatus?: EvaluationStatus;
  evaluationNotes?: string;
  companyResponse?: string;
  companyRespondedAt?: number;
  finalResolution?: string;
  reviewRole?: string;
  reviewTotalScore?: number;
  reviewStarRating?: number;
};

// Advisor Evaluation API Functions
export async function createEvaluation(data: {
  reviewId: string;
  evaluationStatus: "valid" | "invalid" | "requires_company_response";
  evaluationNotes?: string;
}) {
  return apiClient.post<{ evaluation: ReviewEvaluation }>(
    "/peace-seal/advisor/evaluations",
    data
  );
}

export async function updateEvaluation(
  evaluationId: string,
  data: {
    evaluationStatus?: EvaluationStatus;
    evaluationNotes?: string;
    companyResponse?: string;
    finalResolutionNotes?: string;
  }
) {
  return apiClient.put<{ evaluation: ReviewEvaluation }>(
    `/peace-seal/advisor/evaluations/${evaluationId}`,
    data
  );
}

export async function getEvaluationsForAdvisor(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (filters?.status) qs.set("status", filters.status);
  if (filters?.page) qs.set("page", filters.page.toString());
  if (filters?.limit) qs.set("limit", filters.limit.toString());

  return apiClient.get<{
    items: ReviewEvaluation[];
    total: number;
    page: number;
    limit: number;
  }>(`/peace-seal/advisor/evaluations?${qs}`);
}

export async function getCompanyIssues(companyId: string) {
  return apiClient.get<{ issues: CompanyIssue[] }>(
    `/peace-seal/companies/${companyId}/issues`
  );
}

export async function companyRespondToEvaluation(
  evaluationId: string,
  companyResponse: string
) {
  return apiClient.post<{ evaluation: ReviewEvaluation }>(
    `/peace-seal/evaluations/${evaluationId}/respond`,
    { companyResponse }
  );
}

// Peace Seal Renewal Types
export type RenewalStatus = "pending" | "paid" | "failed" | "refunded";
export type BadgeLevel = "bronze" | "silver" | "gold" | null;
export type RewardType =
  | "digital_badge"
  | "physical_badge"
  | "certificate"
  | "brand_toolkit"
  | "network_access"
  | "survey_access";
export type RewardStatus = "pending" | "delivered" | "used" | "expired";
export type ResourceType =
  | "document"
  | "template"
  | "guide"
  | "tool"
  | "survey";
export type ResourceCategory =
  | "hr_policies"
  | "supplier_codes"
  | "peace_statements"
  | "political_guidelines"
  | "compliance";

export type PeaceSealRenewal = {
  id: string;
  companyId: string;
  renewalYear: number;
  amountCents: number;
  paymentStatus: RenewalStatus;
  paymentTransactionId?: string;
  paymentDate?: number;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
};

export type PeaceSealReward = {
  id: string;
  companyId: string;
  rewardType: RewardType;
  status: RewardStatus;
  deliveredAt?: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
};

export type PeaceSealCenterResource = {
  id: string;
  title: string;
  description?: string;
  resourceType: ResourceType;
  fileUrl?: string;
  category: ResourceCategory;
  isPublic: boolean;
  accessLevel: string;
  createdAt: number;
  updatedAt: number;
};

// Peace Seal Renewal API Functions
export async function createRenewal(data: {
  companyId: string;
  renewalYear: number;
  amountCents: number;
  paymentTransactionId?: string;
  paymentDate?: number;
}) {
  return apiClient.post<{ renewal: PeaceSealRenewal }>(
    "/peace-seal/renewals",
    data
  );
}

export async function getCompanyRenewals(companyId: string) {
  return apiClient.get<{ renewals: PeaceSealRenewal[] }>(
    `/peace-seal/companies/${companyId}/renewals`
  );
}

export async function getCompanyRewards(companyId: string) {
  return apiClient.get<{ rewards: PeaceSealReward[] }>(
    `/peace-seal/companies/${companyId}/rewards`
  );
}

export async function updateBadgeLevel(companyId: string, score: number) {
  return apiClient.post<{ badgeLevel: BadgeLevel; score: number }>(
    `/peace-seal/companies/${companyId}/badge-level`,
    { score }
  );
}

export async function requestPhysicalBadge(companyId: string) {
  return apiClient.post<{ success: boolean }>(
    `/peace-seal/companies/${companyId}/physical-badge`
  );
}

export async function generateDigitalBadge(companyId: string) {
  return apiClient.get<{
    badgeUrl: string;
    company: {
      name: string;
      badgeLevel: BadgeLevel;
      score: number;
      status: string;
    };
  }>(`/peace-seal/companies/${companyId}/digital-badge`);
}

export async function processRenewalPayment(data: {
  companyId: string;
  renewalYear: number;
  paymentTransactionId: string;
  paymentDate?: number;
}) {
  return apiClient.post<{ success: boolean }>(
    "/peace-seal/renewals/payment",
    data
  );
}

export async function getExpiringRenewals(daysAhead?: number) {
  const qs = new URLSearchParams();
  if (daysAhead) qs.set("daysAhead", daysAhead.toString());

  return apiClient.get<{ expiringRenewals: any[] }>(
    `/peace-seal/renewals/expiring?${qs}`
  );
}

// Peace Seal Center API Functions
export async function getPeaceSealCenterResources() {
  return apiClient.get<{ resources: PeaceSealCenterResource[] }>(
    "/peace-seal/peace-seal-center/resources"
  );
}

export async function addPeaceSealCenterResource(data: {
  title: string;
  description?: string;
  resourceType: ResourceType;
  fileUrl?: string;
  category: ResourceCategory;
  isPublic?: boolean;
  accessLevel?: string;
}) {
  return apiClient.post<{ resource: PeaceSealCenterResource }>(
    "/peace-seal/peace-seal-center/resources",
    data
  );
}

// Agreement API Functions
export async function acceptAgreement(
  companyId: string,
  data: AcceptAgreementRequest
) {
  return apiClient.post<{
    success: boolean;
    acceptanceId: string;
    acceptedAt: number;
  }>(`/peace-seal/applications/${companyId}/agreements/accept`, data);
}

export async function getAgreementAcceptances(companyId: string) {
  return apiClient.get<{ acceptances: AgreementAcceptance[] }>(
    `/peace-seal/applications/${companyId}/agreements`
  );
}

export async function deleteAgreementAcceptance(
  companyId: string,
  acceptanceId: string
) {
  return apiClient.delete<{ success: boolean }>(
    `/peace-seal/applications/${companyId}/agreements/${acceptanceId}`
  );
}

export async function getTemplates(filters?: {
  category?: string;
  resourceType?: string;
}) {
  const qs = new URLSearchParams();
  if (filters?.category) qs.set("category", filters.category);
  if (filters?.resourceType) qs.set("resourceType", filters.resourceType);

  return apiClient.get<{ templates: TemplateResource[] }>(
    `/peace-seal/templates?${qs}`
  );
}
