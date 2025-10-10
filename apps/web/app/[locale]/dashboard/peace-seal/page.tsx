"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  adminListCompanies,
  adminGetCompany,
  adminUpdateCompany,
  adminConfirmPayment,
  advisorScoreQuestionnaire,
  getUserCompany,
  getCompanyQuestionnaire,
  getReports,
  resolveReport,
  getBadgeLevel,
  adminListReviews,
  adminVerifyReview,
  type Report,
  type CommunityReview,
} from "@/lib/api/peace-seal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Upload,
  Award,
  AlertCircle,
  ExternalLink,
  Flag,
  MessageSquare,
} from "lucide-react";
import { logger } from "@/lib/utils/logger";
import { useToast } from "@/hooks/use-toast";
import type {
  ParsedQuestionnaireSection,
  ParsedQuestionnaireResponse,
} from "@/lib/api/peace-seal";
import { MoneyInput } from "@/components/money-input/money-input";

type CompanyItem = {
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

type UserCompany = {
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

type QuestionnaireData = {
  id: string;
  progress: number;
  completedAt?: string;
  responses?: string;
};

function getStatusIcon(status: string) {
  switch (status) {
    case "verified":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "conditional":
      return <AlertCircle className="w-4 h-4 text-orange-600" />;
    case "did_not_pass":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "under_review":
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case "audit_in_progress":
      return <Clock className="w-4 h-4 text-blue-600" />;
    default:
      return <FileText className="w-4 h-4 text-gray-600" />;
  }
}

function getStatusLabel(status: string): string {
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
    default:
      return "Submitted";
  }
}

function getStatusColor(status: string): string {
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
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

// Helper function to format field labels as fallback
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatQuestionnaireValue(
  response: ParsedQuestionnaireResponse
): React.ReactNode {
  const { answer, isEmpty } = response;

  if (isEmpty || answer === null || answer === undefined || answer === "") {
    return <span className="text-gray-400 italic">Not provided</span>;
  }

  if (typeof answer === "boolean") {
    return (
      <span
        className={`font-medium ${answer ? "text-green-600" : "text-red-600"}`}
      >
        {answer ? "Yes" : "No"}
      </span>
    );
  }

  if (Array.isArray(answer)) {
    return answer.length > 0 ? (
      <div className="space-y-1">
        {answer.map((item, index) => (
          <div key={index} className="text-sm bg-gray-50 px-2 py-1 rounded">
            {String(item)}
          </div>
        ))}
      </div>
    ) : (
      <span className="text-gray-400 italic">None provided</span>
    );
  }

  if (typeof answer === "object" && answer !== null) {
    // Handle file objects
    if (
      "type" in answer &&
      (answer as Record<string, unknown>).type === "file"
    ) {
      const fileObj = answer as {
        type: string;
        name: string;
        size?: number | null;
        url?: string | null;
        id?: string | null;
        mimeType?: string | null;
      };
      return (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-blue-800 font-medium">{fileObj.name}</div>
              <div className="text-xs text-blue-600 space-x-2">
                {fileObj.size && (
                  <span>{(fileObj.size / 1024).toFixed(1)} KB</span>
                )}
                {fileObj.mimeType && <span>• {fileObj.mimeType}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fileObj.url ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => window.open(fileObj.url!, "_blank")}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View File
              </Button>
            ) : (
              <span className="text-xs text-gray-500 italic">
                File uploaded
              </span>
            )}
          </div>
        </div>
      );
    }

    // For other objects, show key-value pairs in a readable format
    return (
      <div className="space-y-1">
        {Object.entries(answer).map(([k, v]) => (
          <div key={k} className="text-sm">
            <span className="font-semibold text-gray-700">
              {formatFieldName(k)}:
              <br />{" "}
            </span>
            <span className="text-gray-600">{String(v || "—")}</span>
          </div>
        ))}
      </div>
    );
  }

  const stringValue = String(answer);

  // Handle long text with better formatting
  if (stringValue.length > 200) {
    return (
      <div className="bg-gray-50 p-3 rounded border">
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {stringValue}
        </p>
      </div>
    );
  }

  return <span className="text-gray-700">{stringValue}</span>;
}

export default function PeaceSealDashboard() {
  const { session } = useAuthSession();
  const { toast } = useToast();

  // Advisor states
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [communityListed, setCommunityListed] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<{
    company: CompanyItem;
    questionnaire?: {
      id: string;
      progress: number;
      completedAt?: string;
      createdAt: string;
      updatedAt: string;
      sections: ParsedQuestionnaireSection[];
      stats: {
        totalQuestions: number;
        answeredQuestions: number;
        completionRate: number;
        sectionsCount: number;
      };
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
  } | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
  });
  const [updating, setUpdating] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [manualScore, setManualScore] = useState<string>("");

  // Reports state
  const [companyReports, setCompanyReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [resolvingReport, setResolvingReport] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");

  // Community Reviews state
  const [reviews, setReviews] = useState<
    Array<CommunityReview & { companyName?: string }>
  >([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewPage] = useState(1);
  const [, setReviewTotal] = useState(0);
  const [reviewStatus, setReviewStatus] = useState("pending");

  // Company states
  const [userCompany, setUserCompany] = useState<UserCompany | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(
    null
  );

  // Common states
  const [loading, setLoading] = useState(true);

  // Check if user has advisor permissions
  const isAdvisor = ["advisor", "admin", "superAdmin"].includes(
    session?.user?.role || ""
  );

  // Check if user is a company
  const isCompany = session?.user?.role === "user" && session?.user?.companyId;

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminListCompanies({
        status:
          selectedStatus && selectedStatus !== "all"
            ? selectedStatus
            : undefined,
        assignedToMe,
        communityListed:
          communityListed && communityListed !== "all"
            ? communityListed === "true"
            : undefined,
        page,
        limit: 20,
      });
      setCompanies(result.items);
      setTotal(result.total);
    } catch (error) {
      logger.error("Failed to load companies:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, assignedToMe, communityListed, page]);

  const loadUserCompanyData = useCallback(async () => {
    setLoading(true);
    try {
      // Load company data
      const companyResult = await getUserCompany();
      setUserCompany(companyResult);

      // Load questionnaire data if company exists
      if (companyResult?.id) {
        try {
          const questionnaireResult = await getCompanyQuestionnaire(
            companyResult.id
          );
          setQuestionnaire(questionnaireResult);
        } catch (error) {
          // Questionnaire might not exist yet, that's okay
          logger.info("No questionnaire found for company:", error);
        }
      }
    } catch (error) {
      logger.error("Failed to load user company data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Community Reviews functions
  const loadReviews = useCallback(async () => {
    if (!isAdvisor) return;

    setLoadingReviews(true);
    try {
      const result = await adminListReviews({
        status: reviewStatus,
        page: reviewPage,
        limit: 20,
      });

      setReviews(result.items);
      setReviewTotal(result.total);
    } catch (error) {
      logger.error("Failed to load reviews:", error);
      toast({
        title: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoadingReviews(false);
    }
  }, [isAdvisor, reviewStatus, reviewPage, toast]);

  useEffect(() => {
    if (isAdvisor) {
      loadCompanies();
      loadReviews();
    } else if (isCompany) {
      loadUserCompanyData();
    }
  }, [isAdvisor, isCompany, loadCompanies, loadUserCompanyData, loadReviews]);

  useEffect(() => {
    if (isAdvisor) {
      loadReviews();
    }
  }, [reviewStatus, reviewPage, isAdvisor, loadReviews]);

  const loadCompanyDetails = async (companyId: string) => {
    try {
      const result = await adminGetCompany(companyId);
      setSelectedCompany(result);
      setUpdateForm({
        status: result.company.status,
      });

      // Load reports for this company
      await loadCompanyReports(companyId);
    } catch (error) {
      logger.error("Failed to load company details:", error);
    }
  };

  const loadCompanyReports = async (companyId: string) => {
    try {
      setLoadingReports(true);
      const reportsData = await getReports({ companyId });
      setCompanyReports(reportsData.items);
    } catch (error) {
      logger.error("Failed to load company reports:", error);
      // Don't show toast error for reports as it's not critical
    } finally {
      setLoadingReports(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCompany) return;

    setUpdating(true);
    try {
      const payload: {
        status?: string;
      } = {};
      if (updateForm.status !== selectedCompany.company.status) {
        payload.status = updateForm.status;
      }

      await adminUpdateCompany(selectedCompany.company.id, payload);

      // Refresh data
      await loadCompanies();
      await loadCompanyDetails(selectedCompany.company.id);

      toast({
        title: "Company updated successfully!",
      });
    } catch (error) {
      logger.error("Failed to update company:", error);
      toast({
        title: "Failed to update company",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleScoreQuestionnaire = async () => {
    if (!selectedCompany) return;

    const manualScoreNum = parseFloat(manualScore);

    // Validate manual score - it's now required
    if (
      !manualScore ||
      isNaN(manualScoreNum) ||
      manualScoreNum < 0 ||
      manualScoreNum > 100
    ) {
      toast({
        title: "Manual score is required and must be between 0 and 100",
      });
      return;
    }

    setScoring(true);
    try {
      const result = await advisorScoreQuestionnaire(
        selectedCompany.company.id,
        manualScoreNum,
        notes || undefined
      );

      // Show result to advisor
      const message = `Questionnaire reviewed and scored successfully!\n\nManual Score: ${result.score}/100\nNew Status: ${result.status}`;

      toast({
        title: message,
      });

      // Refresh data
      await loadCompanies();
      await loadCompanyDetails(selectedCompany.company.id);

      // Clear form
      setManualScore("");
      setNotes("");
    } catch (error) {
      logger.error("Failed to score questionnaire:", error);
      toast({
        title: "Failed to score questionnaire. Please try again.",
      });
    } finally {
      setScoring(false);
    }
  };

  const handleResolveReport = async (
    reportId: string,
    resolution: "resolved" | "dismissed",
    resolutionNotes?: string
  ) => {
    if (!selectedCompany) return;

    setResolvingReport(reportId);
    try {
      await resolveReport(reportId, resolution, resolutionNotes);

      toast({
        title: `Report ${resolution === "resolved" ? "resolved" : "dismissed"} successfully`,
      });

      // Refresh reports and company data
      await loadCompanyReports(selectedCompany.company.id);
      await loadCompanies(); // Refresh company list in case status changed
    } catch (error) {
      logger.error("Failed to resolve report:", error);
      toast({
        title: "Failed to resolve report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResolvingReport(null);
    }
  };

  const handleVerifyReview = async (
    reviewId: string,
    action: "verify" | "dismiss"
  ) => {
    setLoadingReviews(true);
    try {
      await adminVerifyReview(reviewId, action);

      toast({
        title: `Review ${action === "verify" ? "verified" : "dismissed"} successfully`,
      });

      // Reload reviews
      await loadReviews();
    } catch (error) {
      logger.error(`Failed to ${action} review:`, error);
      toast({
        title: `Failed to ${action} review`,
        variant: "destructive",
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!isAdvisor && !isCompany) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You need to be part of a company or have advisor privileges to
              access the Peace Seal dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Company View
  if (isCompany) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Peace Seal Status
                </h2>
                <p className="text-gray-600">
                  Track your Peace Seal application progress
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281]"></div>
              </div>
            ) : userCompany ? (
              <div className="space-y-6">
                {/* Company Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      {userCompany.name} - Peace Seal Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">
                          Status
                        </Label>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(userCompany.status)}
                          <Badge
                            className={`${getStatusColor(userCompany.status)} border`}
                          >
                            {getStatusLabel(userCompany.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">
                          Score
                        </Label>
                        <div className="text-lg font-semibold">
                          {userCompany.score !== null &&
                          userCompany.score !== undefined ? (
                            <span
                              className={
                                userCompany.score >= 70
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }
                            >
                              {userCompany.score}/100
                            </span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">
                          Payment Status
                        </Label>
                        <Badge
                          variant={
                            userCompany.paymentStatus === "paid"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {userCompany.paymentStatus === "paid"
                            ? "Paid"
                            : "Pending"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">
                          Valid Until
                        </Label>
                        <div className="text-sm">
                          {userCompany.expiresAt ? (
                            new Date(userCompany.expiresAt).toLocaleDateString()
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Questionnaire Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Application Questionnaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {questionnaire ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">
                              Progress: {questionnaire.progress}%
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-[#548281] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${questionnaire.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {questionnaire.progress < 100 ? (
                            <Button
                              onClick={() =>
                                (window.location.href = "/peace-seal/apply")
                              }
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Continue Application
                            </Button>
                          ) : questionnaire.completedAt ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">
                                Completed on{" "}
                                {new Date(
                                  questionnaire.completedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          ) : null}

                          <Button
                            variant="outline"
                            onClick={() =>
                              (window.location.href = "/peace-seal/apply")
                            }
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Application
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Application Started
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Start your Peace Seal application to begin the
                          certification process.
                        </p>
                        <Button
                          onClick={() =>
                            (window.location.href = "/peace-seal/apply")
                          }
                          className="flex items-center gap-2 mx-auto"
                        >
                          <FileText className="w-4 h-4" />
                          Start Application
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Documents Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Required Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">
                        Document management will be available once your
                        application is submitted.
                      </p>
                      <Button variant="outline" disabled>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Company Found
                  </h3>
                  <p className="text-gray-600">
                    You don&apos;t seem to be associated with a company yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Peace Seal Management
              </h2>
              <p className="text-gray-600">
                Manage Peace Seal applications and audits
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>Advisor Dashboard</span>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status">Status Filter</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="application_submitted">
                        Submitted
                      </SelectItem>
                      <SelectItem value="audit_in_progress">
                        In Progress
                      </SelectItem>
                      {/* <SelectItem value="audit_completed">Completed</SelectItem> */}
                      <SelectItem value="did_not_pass">Failed</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="conditional">Conditional</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="community">Community Filter</Label>
                  <Select
                    value={communityListed}
                    onValueChange={setCommunityListed}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      <SelectItem value="true">Community Added</SelectItem>
                      <SelectItem value="false">
                        Regular Applications
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {session?.user?.role === "advisor" && (
                  <div className="flex items-end">
                    <Button
                      variant={assignedToMe ? "default" : "outline"}
                      onClick={() => setAssignedToMe(!assignedToMe)}
                      className="w-full"
                    >
                      {assignedToMe ? "Show All" : "Assigned to Me"}
                    </Button>
                  </div>
                )}

                <div className="flex items-end">
                  <Button onClick={loadCompanies} className="w-full">
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Companies Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Companies ({total})
                <div className="text-sm font-normal text-gray-600">
                  Page {page} of {Math.max(1, Math.ceil(total / 20))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281]"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-2">Company</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Score</th>
                        <th className="pb-2">Payment</th>
                        <th className="pb-2">Created</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company) => (
                        <tr key={company.id} className="border-b">
                          <td className="py-3">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {company.name}
                                {company.communityListed && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    Community
                                  </Badge>
                                )}
                                {company.score && (
                                  <Badge
                                    variant={
                                      getBadgeLevel(company.score) === "Gold"
                                        ? "default"
                                        : getBadgeLevel(company.score) ===
                                            "Silver"
                                          ? "secondary"
                                          : "outline"
                                    }
                                    className={
                                      getBadgeLevel(company.score) === "Gold"
                                        ? "bg-yellow-500 text-white text-xs"
                                        : getBadgeLevel(company.score) ===
                                            "Silver"
                                          ? "bg-gray-400 text-white text-xs"
                                          : "bg-orange-500 text-white text-xs"
                                    }
                                  >
                                    {getBadgeLevel(company.score)}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {company.country} • {company.industry}
                                {company.rfqStatus && (
                                  <span className="ml-2 text-blue-600">
                                    • RFQ: {company.rfqStatus}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge
                              className={`${getStatusColor(company.status)} border`}
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(company.status)}
                                {getStatusLabel(company.status)}
                              </div>
                            </Badge>
                          </td>
                          <td className="py-3">
                            {company.score !== null &&
                            company.score !== undefined ? (
                              <span className="font-medium">
                                {company.score}/100
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                company.paymentStatus === "paid"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {company.paymentStatus === "paid"
                                ? "Paid"
                                : "Pending"}
                            </Badge>
                          </td>
                          <td className="py-3">
                            {new Date(company.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => loadCompanyDetails(company.id)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="w-full !max-w-7xl !h-[80vh] !overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Company Review:{" "}
                                    {selectedCompany?.company?.name}
                                  </DialogTitle>
                                </DialogHeader>

                                {selectedCompany && (
                                  <div className="space-y-6">
                                    {/* Company Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Company Information
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                          <p>
                                            <strong>Name:</strong>{" "}
                                            {selectedCompany.company.name}
                                            {selectedCompany.company.score && (
                                              <span className="ml-2">
                                                <Badge
                                                  variant={
                                                    getBadgeLevel(
                                                      selectedCompany.company
                                                        .score
                                                    ) === "Gold"
                                                      ? "default"
                                                      : getBadgeLevel(
                                                            selectedCompany
                                                              .company.score
                                                          ) === "Silver"
                                                        ? "secondary"
                                                        : "outline"
                                                  }
                                                  className={
                                                    getBadgeLevel(
                                                      selectedCompany.company
                                                        .score
                                                    ) === "Gold"
                                                      ? "bg-yellow-500 text-white"
                                                      : getBadgeLevel(
                                                            selectedCompany
                                                              .company.score
                                                          ) === "Silver"
                                                        ? "bg-gray-400 text-white"
                                                        : "bg-orange-500 text-white"
                                                  }
                                                >
                                                  {getBadgeLevel(
                                                    selectedCompany.company
                                                      .score
                                                  )}{" "}
                                                  (
                                                  {
                                                    selectedCompany.company
                                                      .score
                                                  }
                                                  /100)
                                                </Badge>
                                              </span>
                                            )}
                                          </p>
                                          <p>
                                            <strong>Country:</strong>{" "}
                                            {selectedCompany.company.country ||
                                              "—"}
                                          </p>
                                          <p>
                                            <strong>Industry:</strong>{" "}
                                            {selectedCompany.company.industry ||
                                              "—"}
                                          </p>
                                          <p>
                                            <strong>Employees:</strong>{" "}
                                            {selectedCompany.company
                                              .employeeCount || "—"}
                                          </p>
                                          <p>
                                            <strong>Website:</strong>{" "}
                                            {selectedCompany.company.website ||
                                              "—"}
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Payment Information
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                          <p>
                                            <strong>Status:</strong>{" "}
                                            {
                                              selectedCompany.company
                                                .paymentStatus
                                            }
                                            {selectedCompany.company
                                              .rfqStatus && (
                                              <span className="ml-2">
                                                • RFQ:{" "}
                                                {
                                                  selectedCompany.company
                                                    .rfqStatus
                                                }
                                              </span>
                                            )}
                                          </p>
                                          <p>
                                            <strong>Amount:</strong> $
                                            {(selectedCompany.company
                                              .paymentAmountCents || 0) / 100}
                                          </p>
                                          <p>
                                            <strong>Date:</strong>{" "}
                                            {selectedCompany.company.paymentDate
                                              ? new Date(
                                                  selectedCompany.company.paymentDate
                                                ).toLocaleDateString()
                                              : "—"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Questionnaire */}
                                    {selectedCompany.questionnaire && (
                                      <div>
                                        <h4 className="font-medium mb-4 text-lg">
                                          Peace Seal Questionnaire Responses
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                          <div className="flex items-center gap-4">
                                            <div>
                                              <strong>Progress:</strong>{" "}
                                              <span className="text-lg font-semibold text-[#548281]">
                                                {
                                                  selectedCompany.questionnaire
                                                    .progress
                                                }
                                                %
                                              </span>
                                            </div>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                              <div
                                                className="bg-[#548281] h-2 rounded-full transition-all duration-300"
                                                style={{
                                                  width: `${selectedCompany.questionnaire.progress}%`,
                                                }}
                                              ></div>
                                            </div>
                                          </div>
                                          {selectedCompany.questionnaire
                                            .stats && (
                                            <div className="mt-3 text-sm text-gray-600">
                                              <div className="flex gap-4">
                                                <span>
                                                  Questions Answered:{" "}
                                                  {
                                                    selectedCompany
                                                      .questionnaire.stats
                                                      .answeredQuestions
                                                  }{" "}
                                                  /{" "}
                                                  {
                                                    selectedCompany
                                                      .questionnaire.stats
                                                      .totalQuestions
                                                  }
                                                </span>
                                                <span>
                                                  Sections:{" "}
                                                  {
                                                    selectedCompany
                                                      .questionnaire.stats
                                                      .sectionsCount
                                                  }
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {selectedCompany.questionnaire
                                          .sections &&
                                          selectedCompany.questionnaire.sections
                                            .length > 0 && (
                                            <div className="space-y-6">
                                              {selectedCompany.questionnaire.sections.map(
                                                (section) => (
                                                  <div
                                                    key={section.sectionTitle}
                                                    className="border border-gray-200 rounded-lg"
                                                  >
                                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                                      <h5 className="font-semibold text-gray-900">
                                                        {section.sectionTitle}
                                                      </h5>
                                                      <div className="text-xs text-gray-600 mt-1">
                                                        {
                                                          section.responses.filter(
                                                            (r) => !r.isEmpty
                                                          ).length
                                                        }{" "}
                                                        /{" "}
                                                        {
                                                          section.responses
                                                            .length
                                                        }{" "}
                                                        questions answered
                                                      </div>
                                                    </div>
                                                    <div className="p-4 space-y-4">
                                                      {section.responses.map(
                                                        (response) => (
                                                          <div
                                                            key={
                                                              response.fieldId
                                                            }
                                                            className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                                                          >
                                                            <div className="mb-2">
                                                              <label className="text-sm font-bold text-gray-800">
                                                                {
                                                                  response.question
                                                                }
                                                              </label>
                                                            </div>
                                                            <div className="text-sm">
                                                              {formatQuestionnaireValue(
                                                                response
                                                              )}
                                                            </div>
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    )}

                                    {/* Documents Section */}
                                    <div>
                                      <h4 className="font-medium mb-4 text-lg">
                                        Uploaded Documents
                                      </h4>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-4">
                                          Documents uploaded by the company
                                          during the application process.
                                        </p>
                                        {selectedCompany.documents &&
                                        selectedCompany.documents.length > 0 ? (
                                          <div className="space-y-3">
                                            {selectedCompany.documents.map(
                                              (doc) => (
                                                <div
                                                  key={doc.id}
                                                  className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                      <div className="font-medium text-gray-900">
                                                        {doc.fileName}
                                                      </div>
                                                      <div className="text-sm text-gray-500">
                                                        {doc.documentType}
                                                        {doc.fileSize &&
                                                          ` • ${(doc.fileSize / 1024).toFixed(1)} KB`}
                                                        {doc.mimeType &&
                                                          ` • ${doc.mimeType}`}
                                                      </div>
                                                      {doc.fieldId && (
                                                        <div className="text-xs text-gray-400">
                                                          Related to:{" "}
                                                          {formatFieldName(
                                                            doc.fieldId
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      className="h-8 px-3 text-xs"
                                                      onClick={() =>
                                                        window.open(
                                                          doc.fileUrl,
                                                          "_blank"
                                                        )
                                                      }
                                                    >
                                                      <ExternalLink className="w-3 h-3 mr-1" />
                                                      View
                                                    </Button>
                                                    <div
                                                      className={`w-2 h-2 rounded-full ${doc.verifiedByAdvisor ? "bg-green-500" : "bg-yellow-500"}`}
                                                      title={
                                                        doc.verifiedByAdvisor
                                                          ? "Verified"
                                                          : "Pending verification"
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-center py-6 text-gray-500">
                                            <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm">
                                              No documents uploaded yet
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                              Files may be embedded in
                                              questionnaire responses above
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Reports Section */}
                                    <div>
                                      <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Flag className="w-4 h-4 text-red-500" />
                                        Reports
                                      </h4>
                                      {loadingReports ? (
                                        <div className="text-sm text-gray-500">
                                          Loading reports...
                                        </div>
                                      ) : companyReports.length > 0 ? (
                                        <div className="space-y-3">
                                          {companyReports.map((report) => (
                                            <div
                                              key={report.id}
                                              className="border rounded-lg p-3 bg-red-50"
                                            >
                                              <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-red-900">
                                                      {report.reason
                                                        .replace(/_/g, " ")
                                                        .replace(/\b\w/g, (l) =>
                                                          l.toUpperCase()
                                                        )}
                                                    </span>
                                                    <span
                                                      className={`px-2 py-1 text-xs rounded-full ${
                                                        report.status ===
                                                        "pending"
                                                          ? "bg-yellow-100 text-yellow-800"
                                                          : report.status ===
                                                              "resolved"
                                                            ? "bg-red-100 text-red-800"
                                                            : report.status ===
                                                                "dismissed"
                                                              ? "bg-green-100 text-green-800"
                                                              : "bg-gray-100 text-gray-800"
                                                      }`}
                                                    >
                                                      {report.status}
                                                    </span>
                                                  </div>
                                                  <p className="text-sm text-gray-700 mb-2">
                                                    {report.description}
                                                  </p>
                                                  {report.evidence && (
                                                    <p className="text-xs text-gray-600 mb-2">
                                                      <strong>Evidence:</strong>{" "}
                                                      {report.evidence}
                                                    </p>
                                                  )}
                                                  <p className="text-xs text-gray-500">
                                                    Reported:{" "}
                                                    {new Date(
                                                      report.createdAt
                                                    ).toLocaleDateString()}
                                                    {report.reporterName &&
                                                      ` by ${report.reporterName}`}
                                                  </p>
                                                </div>
                                              </div>

                                              {/* Resolution Actions */}
                                              {report.status === "pending" && (
                                                <div className="flex gap-2 mt-3">
                                                  <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                      handleResolveReport(
                                                        report.id,
                                                        "resolved"
                                                      )
                                                    }
                                                    disabled={
                                                      resolvingReport ===
                                                      report.id
                                                    }
                                                  >
                                                    {resolvingReport ===
                                                    report.id
                                                      ? "..."
                                                      : "Confirm Issue"}
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                      handleResolveReport(
                                                        report.id,
                                                        "dismissed"
                                                      )
                                                    }
                                                    disabled={
                                                      resolvingReport ===
                                                      report.id
                                                    }
                                                  >
                                                    {resolvingReport ===
                                                    report.id
                                                      ? "..."
                                                      : "Dismiss"}
                                                  </Button>
                                                </div>
                                              )}

                                              {/* Resolution Info */}
                                              {(report.status === "resolved" ||
                                                report.status ===
                                                  "dismissed") && (
                                                <div className="mt-2 pt-2 border-t border-red-200">
                                                  <p className="text-xs text-gray-600">
                                                    {report.status ===
                                                    "resolved"
                                                      ? "Issue confirmed"
                                                      : "Report dismissed"}
                                                    {report.resolvedAt &&
                                                      ` on ${new Date(report.resolvedAt).toLocaleDateString()}`}
                                                    {report.resolverName &&
                                                      ` by ${report.resolverName}`}
                                                  </p>
                                                  {report.resolutionNotes && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                      <strong>Notes:</strong>{" "}
                                                      {report.resolutionNotes}
                                                    </p>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-500">
                                          No reports for this company.
                                        </div>
                                      )}
                                    </div>

                                    {/* Community Reviews Section */}
                                    <div className="border-t pt-4">
                                      <h4 className="font-medium mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                        Community Reviews
                                      </h4>

                                      {/* Review Status Filter */}
                                      <div className="mb-4">
                                        <Select
                                          value={reviewStatus}
                                          onValueChange={setReviewStatus}
                                        >
                                          <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Filter by status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">
                                              Pending Review
                                            </SelectItem>
                                            <SelectItem value="verified">
                                              Verified
                                            </SelectItem>
                                            <SelectItem value="unverified">
                                              Unverified
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {loadingReviews ? (
                                        <div className="text-sm text-gray-500">
                                          Loading reviews...
                                        </div>
                                      ) : reviews.length > 0 ? (
                                        <div className="space-y-3">
                                          {reviews.map((review) => (
                                            <div
                                              key={review.id}
                                              className="border rounded-lg p-3 bg-blue-50"
                                            >
                                              <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-blue-900">
                                                      {review.companyName ||
                                                        "Unknown Company"}
                                                    </span>
                                                    <Badge
                                                      variant={
                                                        review.verificationStatus ===
                                                        "verified"
                                                          ? "default"
                                                          : review.verificationStatus ===
                                                              "pending"
                                                            ? "secondary"
                                                            : "outline"
                                                      }
                                                    >
                                                      {review.verificationStatus ===
                                                      "verified"
                                                        ? "✓ Verified"
                                                        : review.verificationStatus ===
                                                            "pending"
                                                          ? "⏳ Pending"
                                                          : "Unverified"}{" "}
                                                      {review.role}
                                                    </Badge>
                                                  </div>
                                                  <p className="text-sm text-gray-700 mb-2">
                                                    Score:{" "}
                                                    {review.totalScore || "N/A"}
                                                    /100
                                                    {review.starRating && (
                                                      <span className="ml-2">
                                                        ⭐ {review.starRating}/5
                                                      </span>
                                                    )}
                                                  </p>
                                                  <p className="text-xs text-gray-500">
                                                    Created:{" "}
                                                    {new Date(
                                                      review.createdAt
                                                    ).toLocaleDateString()}
                                                  </p>
                                                </div>
                                              </div>

                                              {/* Action Buttons */}
                                              {review.verificationStatus ===
                                                "pending" && (
                                                <div className="flex gap-2 mt-2">
                                                  <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() =>
                                                      handleVerifyReview(
                                                        review.id,
                                                        "verify"
                                                      )
                                                    }
                                                    disabled={loadingReviews}
                                                  >
                                                    Verify
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                      handleVerifyReview(
                                                        review.id,
                                                        "dismiss"
                                                      )
                                                    }
                                                    disabled={loadingReviews}
                                                  >
                                                    Dismiss
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-500">
                                          No {reviewStatus} reviews found.
                                        </div>
                                      )}
                                    </div>

                                    {/* Application Review & Management */}
                                    <div className="border-t pt-4">
                                      <h4 className="font-medium mb-4">
                                        Application Review & Management
                                      </h4>

                                      {/* Status Management - Always Available */}
                                      <div className="mb-6">
                                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                                          Status Management
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <Label htmlFor="update-status">
                                              Application Status
                                            </Label>
                                            <Select
                                              value={updateForm.status}
                                              onValueChange={(value) =>
                                                setUpdateForm((prev) => ({
                                                  ...prev,
                                                  status: value,
                                                }))
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="application_submitted">
                                                  Submitted
                                                </SelectItem>
                                                <SelectItem value="audit_in_progress">
                                                  In Progress
                                                </SelectItem>
                                                <SelectItem value="under_review">
                                                  Under Review
                                                </SelectItem>
                                                <SelectItem value="verified">
                                                  Verified
                                                </SelectItem>
                                                <SelectItem value="conditional">
                                                  Conditional
                                                </SelectItem>
                                                <SelectItem value="did_not_pass">
                                                  Failed
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div className="flex items-end">
                                            <Button
                                              onClick={handleUpdate}
                                              disabled={updating}
                                              variant="outline"
                                              className="w-full"
                                            >
                                              {updating
                                                ? "Updating..."
                                                : "Update Status"}
                                            </Button>
                                          </div>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-2">
                                          For status changes only. Use the
                                          review section below for scoring and
                                          notes.
                                        </p>
                                      </div>

                                      {/* Manual Review & Scoring - Only for Complete Questionnaires */}
                                      {selectedCompany.questionnaire &&
                                        selectedCompany.questionnaire.stats
                                          .completionRate === 100 && (
                                          <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                                            <h5 className="font-medium mb-3 text-green-900">
                                              🔍 Complete Review & Scoring
                                            </h5>

                                            {/* Payment Status Check */}
                                            {selectedCompany.company
                                              .paymentStatus !== "paid" ? (
                                              <div className="p-3 border border-orange-200 rounded-lg bg-orange-50 mb-4">
                                                <div className="flex items-center gap-2 text-orange-800">
                                                  <AlertTriangle className="w-4 h-4" />
                                                  <span className="font-medium">
                                                    Payment Required
                                                  </span>
                                                </div>
                                                <p className="text-sm text-orange-700 mt-1">
                                                  Payment must be completed
                                                  before scoring can be
                                                  finalized.
                                                  {selectedCompany.company
                                                    .rfqStatus && (
                                                    <span className="block mt-1">
                                                      RFQ Status:{" "}
                                                      <Badge variant="outline">
                                                        {
                                                          selectedCompany
                                                            .company.rfqStatus
                                                        }
                                                      </Badge>
                                                    </span>
                                                  )}
                                                </p>
                                              </div>
                                            ) : (
                                              <p className="text-sm text-green-800 mb-4">
                                                The questionnaire is complete
                                                and ready for scoring. Please
                                                review all responses above and
                                                provide your assessment.
                                              </p>
                                            )}

                                            <div className="space-y-4">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                  <Label
                                                    htmlFor="manual-score"
                                                    className="text-green-900 font-medium"
                                                  >
                                                    Score (0-100) *
                                                  </Label>
                                                  <Input
                                                    id="manual-score"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={manualScore}
                                                    onChange={(e) =>
                                                      setManualScore(
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder="Enter score"
                                                    className="bg-white border-green-300"
                                                  />
                                                  <p className="text-xs text-green-700 mt-1">
                                                    Required: 0-100 based on
                                                    your review
                                                  </p>
                                                </div>

                                                <div className="flex items-center">
                                                  <Button
                                                    onClick={
                                                      handleScoreQuestionnaire
                                                    }
                                                    disabled={
                                                      scoring ||
                                                      !manualScore ||
                                                      selectedCompany.company
                                                        .paymentStatus !==
                                                        "paid"
                                                    }
                                                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                                  >
                                                    {scoring
                                                      ? "Processing..."
                                                      : selectedCompany.company
                                                            .paymentStatus !==
                                                          "paid"
                                                        ? "Payment Required"
                                                        : "Complete Review"}
                                                  </Button>
                                                </div>
                                              </div>

                                              <div>
                                                <Label
                                                  htmlFor="review-notes"
                                                  className="text-green-900 font-medium"
                                                >
                                                  Notes (Optional)
                                                </Label>
                                                <Textarea
                                                  id="review-notes"
                                                  value={notes}
                                                  onChange={(e) =>
                                                    setNotes(e.target.value)
                                                  }
                                                  placeholder="Add notes about your review and scoring rationale..."
                                                  rows={3}
                                                  className="bg-white border-green-300"
                                                />
                                                <p className="text-xs text-green-700 mt-1">
                                                  Optional: Add notes about your
                                                  assessment and scoring
                                                  decision
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                      {/* Admin Payment Confirmation */}
                                      {["admin", "superAdmin"].includes(
                                        session?.user?.role || ""
                                      ) &&
                                        selectedCompany.company.rfqStatus ===
                                          "requested" &&
                                        selectedCompany.company
                                          .paymentStatus !== "paid" && (
                                          <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 mt-4">
                                            <h5 className="font-medium mb-3 text-blue-900">
                                              💳 Admin Payment Confirmation
                                            </h5>
                                            <p className="text-sm text-blue-800 mb-4">
                                              Confirm manual payment for this
                                              company.
                                            </p>

                                            <div className="space-y-4">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                  <Label
                                                    htmlFor="payment-amount"
                                                    className="text-blue-900 font-medium"
                                                  >
                                                    Amount (cents) *
                                                  </Label>
                                                  {/* <Input
                                                    id="payment-amount"
                                                    type="number"
                                                    placeholder="e.g., 49900 for $499"
                                                    className="bg-white border-blue-300"
                                                  /> */}
                                                  <MoneyInput
                                                    id="payment-amount"
                                                    valueCents={
                                                      selectedCompany.company
                                                        .paymentAmountCents ||
                                                      null
                                                    }
                                                    onChangeCents={(cents) => {
                                                      setUpdateForm((prev) => ({
                                                        ...prev,
                                                        paymentAmountCents:
                                                          cents || null,
                                                      }));
                                                    }}
                                                  />
                                                </div>
                                                <div>
                                                  <Label
                                                    htmlFor="payment-tx-id"
                                                    className="text-blue-900 font-medium"
                                                  >
                                                    Transaction ID (optional)
                                                  </Label>
                                                  <Input
                                                    id="payment-tx-id"
                                                    placeholder="External transaction reference"
                                                    className="bg-white border-blue-300"
                                                  />
                                                </div>
                                              </div>

                                              <Button
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                onClick={async () => {
                                                  const amountInput =
                                                    document.getElementById(
                                                      "payment-amount"
                                                    ) as HTMLInputElement;
                                                  const txIdInput =
                                                    document.getElementById(
                                                      "payment-tx-id"
                                                    ) as HTMLInputElement;

                                                  if (!amountInput.value) {
                                                    toast({
                                                      title: "Error",
                                                      description:
                                                        "Amount is required",
                                                      variant: "destructive",
                                                    });
                                                    return;
                                                  }

                                                  try {
                                                    await adminConfirmPayment(
                                                      selectedCompany.company
                                                        .id,
                                                      {
                                                        amountCents: parseInt(
                                                          amountInput.value
                                                        ),
                                                        transactionId:
                                                          txIdInput.value ||
                                                          undefined,
                                                      }
                                                    );

                                                    toast({
                                                      title: "Success",
                                                      description:
                                                        "Payment confirmed successfully",
                                                    });

                                                    // Refresh company data
                                                    await loadCompanyDetails(
                                                      selectedCompany.company.id
                                                    );
                                                    amountInput.value = "";
                                                    txIdInput.value = "";
                                                  } catch {
                                                    toast({
                                                      title: "Error",
                                                      description:
                                                        "Failed to confirm payment",
                                                      variant: "destructive",
                                                    });
                                                  }
                                                }}
                                              >
                                                Confirm Payment
                                              </Button>
                                            </div>
                                          </div>
                                        )}

                                      {selectedCompany.questionnaire &&
                                        selectedCompany.questionnaire.stats
                                          .completionRate < 100 && (
                                          <div className="mt-6 p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                                            <h5 className="font-medium mb-2 text-yellow-900">
                                              ⏳ Questionnaire Incomplete
                                            </h5>
                                            <p className="text-sm text-yellow-800">
                                              The questionnaire is only{" "}
                                              {
                                                selectedCompany.questionnaire
                                                  .stats.completionRate
                                              }
                                              % complete. Scoring is not
                                              available until the company
                                              completes all required fields.
                                            </p>
                                          </div>
                                        )}

                                      {!selectedCompany.questionnaire && (
                                        <div className="mt-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                                          <h5 className="font-medium mb-2 text-gray-700">
                                            📝 No Questionnaire
                                          </h5>
                                          <p className="text-sm text-gray-600">
                                            The company has not started their
                                            questionnaire yet.
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* History */}
                                    {selectedCompany.history.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Status History
                                        </h4>
                                        <div className="space-y-2">
                                          {selectedCompany.history.map(
                                            (entry) => (
                                              <div
                                                key={entry.id}
                                                className="bg-gray-50 p-3 rounded text-sm"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <span className="font-medium">
                                                    {entry.status}
                                                  </span>
                                                  <span className="text-gray-500">
                                                    {new Date(
                                                      entry.createdAt
                                                    ).toLocaleString()}
                                                  </span>
                                                </div>
                                                {entry.score && (
                                                  <p>
                                                    Score: {entry.score}/100
                                                  </p>
                                                )}
                                                {entry.notes && (
                                                  <p className="text-gray-700 mt-1">
                                                    {entry.notes}
                                                  </p>
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                      {companies.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-gray-500"
                          >
                            No companies found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {total > 20 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {Math.ceil(total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / 20)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
