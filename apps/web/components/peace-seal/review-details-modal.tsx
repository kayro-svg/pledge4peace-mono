"use client";

import React, { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { adminGetReviewDetails } from "@/lib/api/peace-seal";
import {
  FileText,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Shield,
  Star,
  Calendar,
} from "lucide-react";

interface ReviewDetailsModalProps {
  reviewId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (reviewId: string, action: "verify" | "dismiss") => void;
  isLoading?: boolean;
}

// Peace Seal questions mapping (same as in community-review-flow)
const PEACE_SEAL_QUESTIONS = {
  ethicalPracticesGovernance: [
    {
      id: "isTransparentOwnership",
      question: "Is the company transparent in ownership and governance?",
    },
    {
      id: "hasAntiCorruptionPolicies",
      question:
        "Are there anti-corruption and equal opportunity policies in practice?",
    },
    {
      id: "avoidsConflictIndustries",
      question:
        "Does the company avoid involvement in war/conflict industries?",
    },
  ],
  employeeRightsWorkplaceCulture: [
    {
      id: "fairWagesBenefits",
      question: "Are wages and benefits fair compared to living standards?",
    },
    {
      id: "hasDeiPrograms",
      question: "Is there diversity, equity, and inclusion?",
    },
    {
      id: "protectsFromHarassment",
      question: "Are employees protected from harassment/discrimination?",
    },
    {
      id: "hasMentalHealthSupport",
      question: "Is there mental health or conflict resolution support?",
    },
  ],
  socialImpactCommunityEngagement: [
    {
      id: "supportsCommunities",
      question:
        "Does the company support local communities, humanitarian aid, or peace initiatives?",
    },
    {
      id: "encouragesVolunteering",
      question: "Are employees encouraged to volunteer or engage in service?",
    },
  ],
  environmentalResponsibility: [
    {
      id: "takesSustainabilitySeriously",
      question:
        "Is sustainability taken seriously (renewable energy, waste management, carbon reduction)?",
    },
    {
      id: "avoidsHarmfulPractices",
      question:
        "Does the company avoid harmful practices like land grabbing or displacement?",
    },
  ],
  transparencyAccountability: [
    {
      id: "reportsPublicly",
      question:
        "Does the company report publicly on impact, finances, or policies?",
    },
    {
      id: "hasGrievanceSystem",
      question: "Is there an open grievance/redressal system for employees?",
    },
  ],
  globalPeaceCommitment: [
    {
      id: "avoidsConflictRegions",
      question:
        "Does the company avoid partnerships in conflict regions or with oppressive regimes?",
    },
    {
      id: "hasPeaceCommitments",
      question: "Has it made public commitments to peace and diplomacy?",
    },
  ],
  publicFeedbackReputation: [
    {
      id: "respondsToFeedback",
      question: "How does the company respond to feedback or complaints?",
    },
    {
      id: "respectsStakeholders",
      question: "Do employees and customers feel respected?",
    },
  ],
  supplyChainFairness: [
    {
      id: "fairSupplierTreatment",
      question: "Are suppliers treated fairly and ethically?",
    },
    {
      id: "transparentSupplyChain",
      question: "Is the supply chain transparent and accountable?",
    },
  ],
};

const SECTION_NAMES = {
  ethicalPracticesGovernance: "Ethical Practices & Governance",
  employeeRightsWorkplaceCulture: "Employee Rights & Workplace Culture",
  socialImpactCommunityEngagement: "Social Impact & Community Engagement",
  environmentalResponsibility: "Environmental Responsibility",
  transparencyAccountability: "Transparency & Accountability",
  globalPeaceCommitment: "Global Peace Commitment",
  publicFeedbackReputation: "Public Feedback & Reputation",
  supplyChainFairness: "Supply Chain Fairness",
};

interface ReviewDetails {
  id: string;
  companyId: string;
  companyName: string;
  role: string;
  verificationStatus: string;
  verificationMethod: string;
  verificationDocumentUrl?: string;
  reviewerName?: string;
  reviewerEmail?: string;
  signedDisclosure: boolean;
  answers: Record<string, string>;
  sectionScores: Record<string, number>;
  totalScore: number;
  starRating: number;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
}

export function ReviewDetailsModal({
  reviewId,
  isOpen,
  onClose,
  onVerify,
  isLoading = false,
}: ReviewDetailsModalProps) {
  const [reviewDetails, setReviewDetails] = useState<ReviewDetails | null>(
    null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && reviewId) {
      loadReviewDetails();
    }
  }, [isOpen, reviewId]);

  const loadReviewDetails = async () => {
    if (!reviewId) return;

    setLoadingDetails(true);
    try {
      const response = await adminGetReviewDetails(reviewId);
      setReviewDetails(response.review as unknown as ReviewDetails);
    } catch (error) {
      toast({
        title: "Error loading review details",
        description: "Failed to load review details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatAnswer = (answer: string) => {
    switch (answer) {
      case "yes":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Yes
          </Badge>
        );
      case "no":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            No
          </Badge>
        );
      case "na":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600">
            N/A
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600">
            Not answered
          </Badge>
        );
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "unverified":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600">
            <XCircle className="w-3 h-3 mr-1" />
            Unverified
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVerificationMethodText = (method: string) => {
    switch (method) {
      case "email":
        return "Email Verification";
      case "linkedin":
        return "LinkedIn Verification";
      case "document":
        return "Document Upload";
      case "receipt":
        return "Receipt/Invoice Upload";
      case "none":
        return "No Verification";
      default:
        return method;
    }
  };

  const renderAnswers = () => {
    if (!reviewDetails) return null;

    const sections = Object.keys(reviewDetails.sectionScores || {});

    return (
      <div className="space-y-4">
        {sections.map((sectionKey) => {
          const sectionName =
            SECTION_NAMES[sectionKey as keyof typeof SECTION_NAMES] ||
            sectionKey;
          const questions =
            PEACE_SEAL_QUESTIONS[
              sectionKey as keyof typeof PEACE_SEAL_QUESTIONS
            ] || [];
          const sectionScore = reviewDetails.sectionScores[sectionKey];

          return (
            <Card key={sectionKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{sectionName}</span>
                  <Badge variant="outline">{sectionScore}/100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questions.map((question) => {
                  const answer = reviewDetails.answers[question.id];
                  return (
                    <div key={question.id} className="space-y-1">
                      <p className="text-sm text-gray-700">
                        {question.question}
                      </p>
                      <div className="flex items-center gap-2">
                        {formatAnswer(answer)}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Review Details
          </DialogTitle>
          <DialogDescription>
            Detailed information for verification and moderation
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281] mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">
                  Loading review details...
                </p>
              </div>
            </div>
          ) : reviewDetails ? (
            <div className="space-y-6">
              {/* Review Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{reviewDetails.companyName}</span>
                    {getVerificationStatusBadge(
                      reviewDetails.verificationStatus
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Role
                      </p>
                      <Badge variant="outline">{reviewDetails.role}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Score
                      </p>
                      <p className="text-sm font-medium">
                        {reviewDetails.totalScore}/100
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Rating
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">
                          {reviewDetails.starRating}/5
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Created
                      </p>
                      <p className="text-sm">
                        {new Date(reviewDetails.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Verification Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Method
                      </p>
                      <p className="text-sm">
                        {getVerificationMethodText(
                          reviewDetails.verificationMethod
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Disclosure Signed
                      </p>
                      <Badge
                        variant={
                          reviewDetails.signedDisclosure
                            ? "default"
                            : "destructive"
                        }
                      >
                        {reviewDetails.signedDisclosure ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>

                  {/* Reviewer Information (for admin only) */}
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Reviewer Information
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviewDetails.reviewerName && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {reviewDetails.reviewerName}
                          </span>
                        </div>
                      )}
                      {reviewDetails.reviewerEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {reviewDetails.reviewerEmail}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Document */}
                  {reviewDetails.verificationDocumentUrl && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Verification Document
                        </p>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <a
                            href={reviewDetails.verificationDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            View Document
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Review Answers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Review Answers</CardTitle>
                </CardHeader>
                <CardContent>{renderAnswers()}</CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Failed to load review details</p>
            </div>
          )}
        </ScrollArea>

        {/* Action Buttons */}
        {reviewDetails && reviewDetails.verificationStatus === "pending" && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => onVerify(reviewDetails.id, "dismiss")}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
            <Button
              onClick={() => onVerify(reviewDetails.id, "verify")}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
