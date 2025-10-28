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
import { createEvaluation, type ReviewEvaluation } from "@/lib/api/peace-seal";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  User,
  Calendar,
} from "lucide-react";

interface EvaluationModalProps {
  reviewId: string | null;
  reviewData: {
    companyName: string;
    role: string;
    totalScore: number;
    starRating: number;
    createdAt: number;
    answers: Record<string, string>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEvaluationCreated: (evaluation: ReviewEvaluation) => void;
}

export function EvaluationModal({
  reviewId,
  reviewData,
  isOpen,
  onClose,
  onEvaluationCreated,
}: EvaluationModalProps) {
  const [evaluationStatus, setEvaluationStatus] = useState<
    "valid" | "invalid" | "requires_company_response"
  >("valid");
  const [evaluationNotes, setEvaluationNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reviewId) return;

    setIsSubmitting(true);
    try {
      const evaluation = await createEvaluation({
        reviewId,
        evaluationStatus,
        evaluationNotes: evaluationNotes.trim() || undefined,
      });

      toast({
        title: "Evaluation created successfully",
        description: `Review marked as ${evaluationStatus === "valid" ? "valid" : evaluationStatus === "invalid" ? "invalid" : "requiring company response"}`,
      });

      onEvaluationCreated(evaluation.evaluation);
      onClose();

      // Reset form
      setEvaluationStatus("valid");
      setEvaluationNotes("");
    } catch (error: unknown) {
      toast({
        title: "Error creating evaluation",
        description: (error as Error).message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "invalid":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "requires_company_response":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-50 text-green-700 border-green-200";
      case "invalid":
        return "bg-red-50 text-red-700 border-red-200";
      case "requires_company_response":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "valid":
        return "The review is valid and does not require any action.";
      case "invalid":
        return "The review is invalid and will be dismissed.";
      case "requires_company_response":
        return "The review requires a response from the company within 30 days.";
      default:
        return "";
    }
  };

  if (!isOpen || !reviewData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-hidden w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Evaluate Community Review
          </DialogTitle>
          <DialogDescription>
            Review the community feedback and determine if action is required
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 w-full">
          {/* Review Summary */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">
                {reviewData.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Role
                  </p>
                  <Badge variant="outline">{reviewData.role}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Score
                  </p>
                  <p className="text-sm font-medium">
                    {reviewData.totalScore}/100
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Rating
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {reviewData.starRating}/5
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Created
                  </p>
                  <p className="text-sm">
                    {new Date(reviewData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base">Evaluation Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Evaluation Status</Label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      value: "valid",
                      label: "Valid Review",
                      description:
                        "The review is legitimate and does not require action",
                    },
                    {
                      value: "invalid",
                      label: "Invalid Review",
                      description:
                        "The review is false, misleading, or inappropriate",
                    },
                    {
                      value: "requires_company_response",
                      label: "Requires Company Response",
                      description:
                        "The company must respond to address the concerns",
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        evaluationStatus === option.value
                          ? "border-[#548281] bg-[#548281]/5"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setEvaluationStatus(option.value as any)}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(option.value)}
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-600">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evaluation-notes">Evaluation Notes</Label>
                <Textarea
                  id="evaluation-notes"
                  value={evaluationNotes}
                  onChange={(e) => setEvaluationNotes(e.target.value)}
                  placeholder="Add notes about your evaluation decision..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  {getStatusDescription(evaluationStatus)}
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
            disabled={isSubmitting}
            className="bg-[#548281] hover:bg-[#2F4858]"
          >
            {isSubmitting ? "Creating..." : "Create Evaluation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
