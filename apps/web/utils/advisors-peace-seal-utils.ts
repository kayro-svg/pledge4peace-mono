export type CompanyItem = {
  id: string;
  slug: string;
  name: string;
  country?: string | null;
  website?: string | null;
  industry?: string | null;
  employeeCount?: number | null;
  status: string;
  score?: number | null;
  paymentStatus: string;
  paymentAmountCents?: number | null;
  paymentDate?: string | number | null;
  rfqStatus?: string | null;
  rfqRequestedAt?: string | number | null;
  rfqQuotedAmountCents?: number | null;
  createdAt: string | number;
  updatedAt: string | number;
  lastReviewedAt?: string | number | null;
  advisorUserId?: string | null;
  notes?: string | null;
  expiresAt?: string | number | null;
  communityListed?: number | null;
  employeeRatingAvg?: number | null;
  employeeRatingCount?: number | null;
  overallRatingAvg?: number | null;
  overallRatingCount?: number | null;
};

export type UserCompany = {
  id: string;
  slug: string;
  name: string;
  country?: string | null;
  industry?: string | null;
  employeeCount?: number | null;
  status: string;
  score?: number | null;
  paymentStatus: string;
  paymentAmountCents?: number | null;
  createdAt: string | number;
  updatedAt: string | number;
  verifiedAt?: string | number | null;
  expiresAt?: string | number | null;
};

export type QuestionnaireData = {
  id: string;
  progress: number;
  completedAt?: string;
  responses?: string;
};

export function getStatusLabel(
  status: string,
  rfqStatus?: string | null
): string {
  if (rfqStatus === "requested") {
    return "Pending Quote";
  }
  switch (status) {
    case "verified":
      return "Verified";
    case "conditional":
      return "Conditional";
    case "did_not_pass":
      return "Failed";
    case "under_review":
      return "Under Review";
    case "audit_in_progress":
      return "In Progress";
    case "application_submitted":
      return "Submitted";
    case "application_started":
      return "Application Started";
    case "draft":
      return "Draft";
    default:
      return "Submitted";
  }
}

export function getStatusColor(
  status: string,
  rfqStatus?: string | null
): string {
  if (rfqStatus === "requested") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }
  switch (status) {
    case "verified":
      return "bg-green-50 text-green-700 border-green-200";
    case "conditional":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "did_not_pass":
      return "bg-red-50 text-red-700 border-red-200";
    case "under_review":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "audit_in_progress":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "application_submitted":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "application_started":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "draft":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

// Helper function to format field labels as fallback
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
