"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  getUserCompany,
  getCompanyQuestionnaire,
  getMyReviews,
} from "@/lib/api/peace-seal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Edit,
  Eye,
  Calendar,
  DollarSign,
  Building,
  Globe,
  Users,
  ExternalLink,
  PlayCircle,
  ArrowLeft,
} from "lucide-react";
import { logger } from "@/lib/utils/logger";
import QuestionnaireForm from "@/components/peace-seal/questionnaire/QuestionnaireForm";
import { toast } from "@/hooks/use-toast";

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
  createdAt: string;
  updatedAt: string;
};

function getStatusIcon(status: string) {
  switch (status) {
    case "verified":
    case "audit_completed": // Legacy support
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "did_not_pass":
      return <XCircle className="w-5 h-5 text-red-600" />;
    case "under_review":
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case "audit_in_progress":
      return <Clock className="w-5 h-5 text-blue-600" />;
    case "conditional":
      return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    default:
      return <FileText className="w-5 h-5 text-gray-600" />;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "verified":
      return "Peace Seal Certified";
    case "audit_completed": // Legacy support
      return "Audit Completed";
    case "conditional":
      return "Conditional Approval";
    case "did_not_pass":
      return "Did Not Pass";
    case "under_review":
      return "Under Review";
    case "audit_in_progress":
      return "Audit in Progress";
    case "application_submitted":
      return "Application Submitted";
    default:
      return "Draft";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "verified":
    case "audit_completed": // Legacy support
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
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getStatusDescription(status: string): string {
  switch (status) {
    case "verified":
      return "Congratulations! Your company has been certified with the Peace Seal.";
    case "audit_completed": // Legacy support
      return "Your Peace Seal application has been successfully completed and approved.";
    case "conditional":
      return "Your application has been conditionally approved. Review the comments from the advisor.";
    case "did_not_pass":
      return "Your application did not meet the requirements of the Peace Seal. Review the comments and apply again.";
    case "under_review":
      return "Your application is being reviewed by our advisors.";
    case "audit_in_progress":
      return "An advisor is auditing your application and documents.";
    case "application_submitted":
      return "Your application has been sent and is waiting for review.";
    default:
      return "Your application is in draft. Complete the questionnaire to send it.";
  }
}

export default function CompanyPeaceSealDashboard() {
  const { session } = useAuthSession();
  const [userCompany, setUserCompany] = useState<UserCompany | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasReviews, setHasReviews] = useState(false);
  const [isCommunityListedCompany, setIsCommunityListedCompany] =
    useState(false);

  // Check if user is a company (will be determined after loading company data)
  const isUser = session?.user?.role === "user";

  const loadUserCompanyData = useCallback(async () => {
    if (!isUser) return;

    setLoading(true);
    setError(null);

    try {
      // Try to load company data - this will fail if user doesn't have a company
      const companyResult = await getUserCompany();
      setUserCompany(companyResult);

      // Check if this is a community listed company (not a Peace Seal company)
      const isCommunityListed = companyResult.communityListed === 1;
      setIsCommunityListedCompany(isCommunityListed);

      // Load questionnaire data if company exists and is not community listed
      if (companyResult?.id && !isCommunityListed) {
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
      logger.info("User does not have a company associated:", error);
      // This is expected for users without companies, so don't set it as an error
      setUserCompany(null);
      setIsCommunityListedCompany(false);

      // Check if user has reviews instead
      try {
        const reviewsResult = await getMyReviews({ page: 1, limit: 1 });
        setHasReviews(reviewsResult.total > 0);
      } catch (reviewError) {
        logger.info("User has no reviews:", reviewError);
        setHasReviews(false);
      }
    } finally {
      setLoading(false);
    }
  }, [isUser]);

  useEffect(() => {
    loadUserCompanyData();
  }, [loadUserCompanyData]);

  const handleStartApplication = () => {
    setShowQuestionnaire(true);
  };

  const handleContinueApplication = () => {
    setShowQuestionnaire(true);
  };

  const handleViewApplication = () => {
    setShowQuestionnaire(true);
  };

  const handleQuestionnaireComplete = (data: unknown) => {
    logger.info("Questionnaire completed:", data);
    setShowQuestionnaire(false);

    // Show success message
    toast({
      title: "Application Submitted",
      description:
        "Your application has been sent for review by our advisors. We'll notify you about the progress of your Peace Seal certification.",
    });

    // Reload company data to get updated status
    loadUserCompanyData();
  };

  const handleBackToDashboard = () => {
    setShowQuestionnaire(false);
    // Reload data to get latest changes
    loadUserCompanyData();
  };

  // Check if user has the right role (must be a regular user, not admin/advisor)
  if (!isUser) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This dashboard is only available for company users.
            </p>
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#548281] mb-4"></div>
        <p className="text-gray-600">Loading your Peace Seal status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadUserCompanyData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userCompany) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-500" />
              {hasReviews ? "Community Reviewer" : "No Company Found"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasReviews ? (
              <>
                <p className="text-gray-600 mb-4">
                  You&apos;ve been reviewing companies in our community
                  directory, but you don&apos;t have a company registered for
                  Peace Seal certification.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  If you want to apply for Peace Seal certification for your
                  company, please contact support.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      (window.location.href = "/dashboard/my-reviews")
                    }
                    className="flex-1"
                  >
                    View My Reviews
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open("/contact", "_blank")}
                  >
                    Contact Support
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  You don&apos;t seem to be associated with a company yet.
                </p>
                <p className="text-sm text-gray-500">
                  Please contact support to get your company set up for Peace
                  Seal certification.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has a company but it's community listed, redirect to reviews
  if (isCommunityListedCompany) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-500" />
              Community Listed Company
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your company &quot;{userCompany.name}&quot; is listed in our
              community directory for reviews, but it&apos;s not registered for
              Peace Seal certification.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              If you want to apply for Peace Seal certification for your
              company, please contact support.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => (window.location.href = "/dashboard/my-reviews")}
                className="flex-1"
              >
                View My Reviews
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("/contact", "_blank")}
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = questionnaire?.progress === 100;

  // Show questionnaire form if user wants to continue/start application
  if (showQuestionnaire && userCompany) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6">
          <div className="px-4 lg:px-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Award className="w-8 h-8 text-[#548281]" />
                    Peace Seal Application
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Complete your Peace Seal certification questionnaire
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <Building className="w-4 h-4" />
                <span>{userCompany.name}</span>
              </div>
            </div>

            {/* Questionnaire Form */}
            <QuestionnaireForm
              companyId={userCompany.id}
              initialData={
                questionnaire?.responses
                  ? (() => {
                      try {
                        return JSON.parse(questionnaire.responses);
                      } catch (error) {
                        logger.error(
                          "Error parsing questionnaire responses:",
                          error
                        );
                        return undefined;
                      }
                    })()
                  : undefined
              }
              onComplete={handleQuestionnaireComplete}
              isCompleted={isCompleted}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 py-6">
        <div className="px-4 lg:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Award className="w-8 h-8 text-[#548281]" />
                Peace Seal Certification
              </h1>
              <p className="text-gray-600 mt-2">
                Track your Peace Seal certification progress and status
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <Building className="w-4 h-4" />
              <span>{userCompany.name}</span>
            </div>
          </div>

          {/* Status Overview */}
          <Card className="mb-6 border-l-4 border-l-[#548281]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getStatusIcon(userCompany.status)}
                <div>
                  <h2 className="text-xl">Peace Seal Status</h2>
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    {getStatusDescription(userCompany.status)}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FileText className="w-4 h-4" />
                    Current Status
                  </div>
                  <Badge
                    className={`${getStatusColor(userCompany.status)} border text-sm px-3 py-1`}
                  >
                    {getStatusLabel(userCompany.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Award className="w-4 h-4" />
                    Score
                  </div>
                  <div className="text-2xl font-bold">
                    {userCompany.score !== null &&
                    userCompany.score !== undefined ? (
                      <span
                        className={
                          userCompany.score >= 70
                            ? "text-green-600"
                            : userCompany.score >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
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
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    Payment Status
                  </div>
                  <Badge
                    variant={
                      userCompany.paymentStatus === "paid"
                        ? "default"
                        : "secondary"
                    }
                    className="text-sm px-3 py-1"
                  >
                    {userCompany.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Valid Until
                  </div>
                  <div className="text-lg font-medium">
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

          {/* Company Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Globe className="w-4 h-4" />
                    Country
                  </div>
                  <p className="text-lg">
                    {userCompany.country || "Not specified"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Building className="w-4 h-4" />
                    Industry
                  </div>
                  <p className="text-lg">
                    {userCompany.industry || "Not specified"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Users className="w-4 h-4" />
                    Employees
                  </div>
                  <p className="text-lg">
                    {userCompany.employeeCount || "Not specified"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </div>
                  <p className="text-lg">
                    {new Date(userCompany.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Progress */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Peace Seal Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questionnaire ? (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">
                          Application Progress
                        </p>
                        <p className="text-2xl font-bold text-[#548281]">
                          {questionnaire.progress}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {isCompleted ? "Completed" : "In Progress"}
                        </p>
                        {questionnaire.completedAt && (
                          <p className="text-xs text-gray-400">
                            Completed on{" "}
                            {new Date(
                              questionnaire.completedAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Progress value={questionnaire.progress} className="h-3" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {!isCompleted && (
                      <Button
                        onClick={handleContinueApplication}
                        className="flex items-center gap-2"
                        size="lg"
                      >
                        <Edit className="w-4 h-4" />
                        Continue Application
                      </Button>
                    )}

                    {isCompleted && (
                      <Button
                        variant="outline"
                        onClick={handleViewApplication}
                        className="flex items-center gap-2"
                        size="lg"
                      >
                        <Eye className="w-4 h-4" />
                        Review Application
                      </Button>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {userCompany.status === "application_submitted"
                            ? "Application sent and in review"
                            : userCompany.status === "under_review"
                              ? "In review! An advisor has been assigned and is reviewing your application."
                              : userCompany.status === "audit_in_progress"
                                ? "In audit! Your advisor is evaluating the questionnaire responses."
                                : userCompany.status === "verified"
                                  ? "Congratulations! Peace Seal certified!"
                                  : userCompany.status === "conditional"
                                    ? "Conditional approval - Review comments from the advisor"
                                    : userCompany.status === "did_not_pass"
                                      ? "Not approved - Review comments and apply again"
                                      : userCompany.status === "audit_completed"
                                        ? "Congratulations! Peace Seal certified!"
                                        : "Application completed and sent for review!"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Started
                      </p>
                      <p className="text-sm text-gray-700">
                        {new Date(questionnaire.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Last Updated
                      </p>
                      <p className="text-sm text-gray-700">
                        {new Date(questionnaire.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* No Application Started */
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to Start Your Peace Seal Journey?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Begin your Peace Seal certification by completing our
                    comprehensive questionnaire. This process will help us
                    understand your company&apos;s commitment to peace and
                    sustainability.
                  </p>
                  <Button
                    onClick={handleStartApplication}
                    className="flex items-center gap-2 mx-auto"
                    size="lg"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Start Peace Seal Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 py-4 flex flex-col items-start gap-2 hover:bg-white hover:text-black hover:border-gray-300 transition-all duration-300"
                  onClick={() => window.open("/peace-seal", "_blank")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Award className="w-5 h-5 text-[#548281]" />
                    <span className="font-medium">Learn About Peace Seal</span>
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Understand the benefits and requirements
                  </p>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 py-4 flex flex-col items-start gap-2 hover:bg-white hover:text-black hover:border-gray-300 transition-all duration-300"
                  onClick={() => window.open("/contact", "_blank")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Building className="w-5 h-5 text-[#548281]" />
                    <span className="font-medium">Contact Support</span>
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Get help with your application
                  </p>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 py-4 flex flex-col items-start gap-2 hover:bg-white hover:text-black hover:border-gray-300 transition-all duration-300"
                  onClick={() => window.open("/campaigns", "_blank")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <FileText className="w-5 h-5 text-[#548281]" />
                    <span className="font-medium">Support Our Work</span>
                  </div>
                  <p className="text-sm text-gray-500 text-left">
                    Support our work and help us achieve our mission
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
