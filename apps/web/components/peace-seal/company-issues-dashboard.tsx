"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getCompanyIssues, type CompanyIssue } from "@/lib/api/peace-seal";
import { CompanyResponseModal } from "./company-response-modal";
import {
  AlertTriangle,
  Clock,
  Star,
  Flag,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface CompanyIssuesDashboardProps {
  companyId: string;
}

export function CompanyIssuesDashboard({
  companyId,
}: CompanyIssuesDashboardProps) {
  const [issues, setIssues] = useState<CompanyIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const { toast } = useToast();

  const loadIssues = async () => {
    setLoading(true);
    try {
      const result = await getCompanyIssues(companyId);
      setIssues(result.issues);
    } catch (error) {
      toast({
        title: "Error loading issues",
        description: "Failed to load company issues. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [companyId]);

  const handleRespondToIssue = (issue: CompanyIssue) => {
    // Create evaluation object from issue data
    const evaluation = {
      id: issue.evaluationId,
      evaluationStatus: issue.evaluationStatus,
      evaluationNotes: issue.evaluationNotes,
      companyResponseDeadline: issue.companyResponseDeadline
        ? issue.companyResponseDeadline
        : issue.createdAt + 30 * 24 * 60 * 60 * 1000, // Fallback to 30 days from creation
      reviewRole: issue.reviewRole,
      reviewTotalScore: issue.reviewTotalScore,
      reviewStarRating: issue.reviewStarRating,
      reviewExperienceDescription: issue.reviewExperienceDescription,
    };

    setSelectedEvaluation(evaluation);
    setShowResponseModal(true);
  };

  const handleResponseSubmitted = () => {
    loadIssues(); // Refresh issues
    setShowResponseModal(false);
    setSelectedEvaluation(null);
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setSelectedEvaluation(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "dismissed":
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  const activeIssues = issues.filter((issue) => issue.status === "active");
  const resolvedIssues = issues.filter((issue) => issue.status === "resolved");
  const dismissedIssues = issues.filter(
    (issue) => issue.status === "dismissed"
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Active Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {activeIssues.length}
            </div>
            <p className="text-xs text-gray-500">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Resolved Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resolvedIssues.length}
            </div>
            <p className="text-xs text-gray-500">Successfully addressed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-gray-600" />
              Dismissed Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {dismissedIssues.length}
            </div>
            <p className="text-xs text-gray-500">Not applicable</p>
          </CardContent>
        </Card>
      </div>

      {/* Peace Seal Status Alert */}
      {activeIssues.length > 10 && (
        <Alert className="border-red-200 bg-red-50">
          <Flag className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Peace Seal Revoked:</strong> Your company has more than 10
            unresolved issues. Your Peace Seal has been revoked and will remain
            suspended until issues are resolved.
          </AlertDescription>
        </Alert>
      )}

      {activeIssues.length > 5 && activeIssues.length <= 10 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Peace Seal Suspended:</strong> Your company has{" "}
            {activeIssues.length} unresolved issues. Your Peace Seal has been
            suspended. Resolve issues to restore your certification.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Issues */}
      {activeIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Active Issues ({activeIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeIssues.map((issue) => {
                // Use companyResponseDeadline from backend if available, otherwise calculate 30 days from creation
                const deadlineTimestamp = issue.companyResponseDeadline
                  ? issue.companyResponseDeadline
                  : issue.createdAt + 30 * 24 * 60 * 60 * 1000;
                const daysUntilDeadline = Math.ceil(
                  (deadlineTimestamp - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const isOverdue = daysUntilDeadline < 0;

                return (
                  <div
                    key={issue.id}
                    className="border rounded-lg p-4 bg-orange-50 border-orange-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-orange-900">
                            {issue.issueType
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity} severity
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">
                          {issue.reviewRole} Review - Score:{" "}
                          {issue.reviewTotalScore || "N/A"}/100
                          {issue.reviewStarRating && (
                            <span className="ml-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-current inline" />
                              {issue.reviewStarRating}/5
                            </span>
                          )}
                        </p>

                        {issue.evaluationNotes && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-600">
                              <strong>Advisor Notes:</strong>{" "}
                              {issue.evaluationNotes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Created:{" "}
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : "text-orange-600"}`}
                          >
                            <Clock className="w-3 h-3" />
                            {isOverdue
                              ? `${Math.abs(daysUntilDeadline)} days overdue`
                              : `${daysUntilDeadline} days remaining`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespondToIssue(issue)}
                        className="bg-[#548281] hover:bg-[#2F4858]"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Respond
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolved Issues */}
      {resolvedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Resolved Issues ({resolvedIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="border rounded-lg p-3 bg-green-50 border-green-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-green-900">
                          {issue.issueType
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          Resolved
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        {issue.reviewRole} Review - Score:{" "}
                        {issue.reviewTotalScore || "N/A"}/100
                        {issue.reviewStarRating && (
                          <span className="ml-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current inline" />
                            {issue.reviewStarRating}/5
                          </span>
                        )}
                      </p>

                      {issue.companyResponse && (
                        <p className="text-xs text-gray-600 mb-2">
                          <strong>Your Response:</strong>{" "}
                          {issue.companyResponse}
                        </p>
                      )}

                      <p className="text-xs text-gray-500">
                        Resolved:{" "}
                        {issue.resolvedAt
                          ? new Date(issue.resolvedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Issues */}
      {issues.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Issues Found
            </h3>
            <p className="text-gray-600">
              Your company has no outstanding issues. Keep up the great work!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Company Response Modal */}
      <CompanyResponseModal
        evaluation={selectedEvaluation}
        isOpen={showResponseModal}
        onClose={handleCloseResponseModal}
        onResponseSubmitted={handleResponseSubmitted}
      />
    </div>
  );
}
