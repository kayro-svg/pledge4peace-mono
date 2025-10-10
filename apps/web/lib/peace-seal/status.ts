// apps/web/lib/peace-seal/status.ts  (sin 'use client')
export type CompanyStatus =
  | "verified"
  | "did_not_pass"
  | "application_submitted"
  | "audit_in_progress"
  | "under_review"
  | "draft"
  | "pending";

const LABEL: Record<CompanyStatus | string, string> = {
  verified: "Verified",
  did_not_pass: "Did Not Pass Audit",
  application_submitted: "Application Submitted",
  audit_in_progress: "Audit in Progress",
  under_review: "Under Review",
  draft: "Draft",
  pending: "Pending",
};

const PILL: Record<CompanyStatus | string, string> = {
  verified: "border-green-200 bg-green-50 text-green-800",
  did_not_pass: "border-red-200 bg-red-50 text-red-800",
  application_submitted: "border-yellow-200 bg-yellow-50 text-yellow-800",
  audit_in_progress: "border-yellow-200 bg-yellow-50 text-yellow-800",
  under_review: "border-yellow-200 bg-yellow-50 text-yellow-800",
  draft: "border-gray-200 bg-gray-50 text-gray-700",
  pending: "border-gray-200 bg-gray-50 text-gray-700",
};

export function getStatusLabel(s: string) {
  return LABEL[s] ?? "Unknown";
}

export function getStatusClasses(s: string) {
  return PILL[s] ?? "border-gray-200 bg-gray-50 text-gray-700";
}
