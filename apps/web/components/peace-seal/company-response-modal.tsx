"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  companyRespondToEvaluation,
  type ReviewEvaluation,
} from "@/lib/api/peace-seal";
import { AlertTriangle, Clock, Star, XCircle } from "lucide-react";

interface CompanyResponseModalProps {
  evaluation: ReviewEvaluation | null;
  isOpen: boolean;
  onClose: () => void;
  onResponseSubmitted: () => void;
}

export function CompanyResponseModal({
  evaluation,
  isOpen,
  onClose,
  onResponseSubmitted,
}: CompanyResponseModalProps) {
  const [companyResponse, setCompanyResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!evaluation || !companyResponse.trim()) return;

    setIsSubmitting(true);
    try {
      await companyRespondToEvaluation(evaluation.id, companyResponse.trim());

      toast({
        title: "Response submitted successfully",
        description:
          "Your response has been submitted and will be reviewed by our advisors.",
      });

      onResponseSubmitted();
      onClose();

      // Reset form
      setCompanyResponse("");
    } catch (error: unknown) {
      toast({
        title: "Error submitting response",
        description: (error as Error).message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const isDeadlinePassed = evaluation?.companyResponseDeadline
    ? new Date() > new Date(evaluation.companyResponseDeadline)
    : false;

  const daysUntilDeadline = evaluation?.companyResponseDeadline
    ? Math.ceil(
        (evaluation.companyResponseDeadline - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  if (!isOpen || !evaluation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[700px] !max-w-none h-[70vh] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Respond to Review Evaluation
          </DialogTitle>
          <DialogDescription>
            Address the concerns raised in the community review
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          {/* Evaluation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Review Evaluation</span>
                <Badge className={getSeverityColor("medium")}>
                  Requires Response
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Reviewer Role
                    </p>
                    <Badge variant="outline">{evaluation.reviewRole}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Score
                    </p>
                    <p className="text-sm font-medium">
                      {evaluation.reviewTotalScore}/100
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Rating
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">
                        {evaluation.reviewStarRating}/5
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Review Date
                    </p>
                    <p className="text-sm">
                      {evaluation.reviewCreatedAt
                        ? new Date(
                            evaluation.reviewCreatedAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {evaluation.reviewExperienceDescription && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Reviewer Experience
                    </p>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {evaluation.reviewExperienceDescription}
                      </p>
                    </div>
                  </div>
                )}

                {evaluation.evaluationNotes && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Advisor Notes
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {evaluation.evaluationNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deadline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Response Deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isDeadlinePassed ? (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Deadline Passed
                      </p>
                      <p className="text-xs text-red-600">
                        The response deadline has passed. Please contact
                        support.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {daysUntilDeadline} days remaining
                      </p>
                      <p className="text-xs text-yellow-600">
                        Response due:{" "}
                        {evaluation.companyResponseDeadline
                          ? new Date(
                              evaluation.companyResponseDeadline
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-response">
                  Address the concerns raised in this review *
                </Label>
                <Textarea
                  id="company-response"
                  value={companyResponse}
                  onChange={(e) => setCompanyResponse(e.target.value)}
                  placeholder="Please provide a detailed response addressing the concerns raised in this review. Explain any actions you plan to take or clarifications you can provide..."
                  rows={6}
                  disabled={isDeadlinePassed}
                />
                <p className="text-xs text-gray-500">
                  Your response will be reviewed by our advisors and may be
                  shared publicly if appropriate.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || !companyResponse.trim() || isDeadlinePassed
            }
            className="bg-[#548281] hover:bg-[#2F4858]"
          >
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
