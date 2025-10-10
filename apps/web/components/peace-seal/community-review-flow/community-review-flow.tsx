"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  createReview,
  type CreateReviewData,
  type ReviewRole,
  type VerificationMethod,
} from "@/lib/api/peace-seal";
import { Star, Upload, CheckCircle, AlertCircle } from "lucide-react";

type CommunityReviewFlowProps = {
  companyId: string;
  companyName: string;
  onComplete: () => void;
  onCancel: () => void;
};

type ReviewStep =
  | "role"
  | "verification"
  | "questions"
  | "disclosure"
  | "complete";

// Peace Seal questions by section
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

// Role-based section weights
const ROLE_WEIGHTS = {
  employee: {
    ethicalPracticesGovernance: 0.25,
    employeeRightsWorkplaceCulture: 0.3,
    socialImpactCommunityEngagement: 0.15,
    transparencyAccountability: 0.1,
    globalPeaceCommitment: 0.1,
    publicFeedbackReputation: 0.1,
  },
  customer: {
    ethicalPracticesGovernance: 0.2,
    socialImpactCommunityEngagement: 0.2,
    environmentalResponsibility: 0.2,
    transparencyAccountability: 0.2,
    publicFeedbackReputation: 0.2,
  },
  investor: {
    ethicalPracticesGovernance: 0.3,
    transparencyAccountability: 0.25,
    globalPeaceCommitment: 0.25,
    environmentalResponsibility: 0.1,
    publicFeedbackReputation: 0.1,
  },
  supplier: {
    ethicalPracticesGovernance: 0.25,
    supplyChainFairness: 0.25,
    transparencyAccountability: 0.2,
    globalPeaceCommitment: 0.2,
    publicFeedbackReputation: 0.1,
  },
};

export function CommunityReviewFlow({
  companyId,
  companyName,
  onComplete,
  onCancel,
}: CommunityReviewFlowProps) {
  const [currentStep, setCurrentStep] = useState<ReviewStep>("role");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [role, setRole] = useState<ReviewRole | "">("");
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>("none");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [experienceDescription, setExperienceDescription] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [signedDisclosure, setSignedDisclosure] = useState(false);

  const getAvailableSections = () => {
    if (!role) return [];
    const weights = ROLE_WEIGHTS[role as ReviewRole];
    return Object.keys(weights).map((sectionKey) => ({
      key: sectionKey,
      title: sectionKey
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim(),
      weight: weights[sectionKey as keyof typeof weights],
    }));
  };

  const getQuestionsForSection = (sectionKey: string) => {
    return (
      PEACE_SEAL_QUESTIONS[sectionKey as keyof typeof PEACE_SEAL_QUESTIONS] ||
      []
    );
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    switch (currentStep) {
      case "role":
        if (!role) {
          toast({
            title: "Please select your role",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep("verification");
        break;
      case "verification":
        if (!reviewerName.trim()) {
          toast({
            title: "Please enter your name",
            variant: "destructive",
          });
          return;
        }
        if (verificationMethod === "email" && !reviewerEmail.trim()) {
          toast({
            title: "Please enter your email for verification",
            variant: "destructive",
          });
          return;
        }
        if (!experienceDescription.trim()) {
          toast({
            title: "Please describe your experience",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep("questions");
        break;
      case "questions":
        // Check if at least one question is answered
        const hasAnswers = Object.values(answers).some(
          (answer) => answer && answer !== ""
        );
        if (!hasAnswers) {
          toast({
            title: "Please answer at least one question",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep("disclosure");
        break;
      case "disclosure":
        if (!signedDisclosure) {
          toast({
            title: "Please accept the disclosure",
            variant: "destructive",
          });
          return;
        }
        handleSubmit();
        break;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewData = {
        companyId,
        role: role as ReviewRole,
        verificationMethod,
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim() || undefined,
        signedDisclosure: true,
        answers,
      };

      await createReview(reviewData);

      toast({
        title: "Review submitted successfully!",
        description: "Your review has been submitted and will be processed.",
      });

      setCurrentStep("complete");
    } catch (error: unknown) {
      toast({
        title: "Error submitting review",
        description: (error as Error).message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Your Role with {companyName}</CardTitle>
        <CardDescription>
          Please select your relationship with this company. This determines
          which aspects you'll be asked to review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              value: "employee",
              label: "Employee",
              description: "Current or former employee",
            },
            {
              value: "customer",
              label: "Customer",
              description: "Customer or client",
            },
            {
              value: "investor",
              label: "Investor",
              description: "Current or former investor",
            },
            {
              value: "supplier",
              label: "Supplier",
              description: "Supplier or business partner",
            },
          ].map((roleOption) => (
            <Card
              key={roleOption.value}
              className={`cursor-pointer transition-colors ${
                role === roleOption.value
                  ? "border-[#548281] bg-[#548281]/5"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setRole(roleOption.value as ReviewRole)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold">{roleOption.label}</h3>
                <p className="text-sm text-gray-600">
                  {roleOption.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderVerificationStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Verification & Experience</CardTitle>
        <CardDescription>
          Help us verify your relationship with {companyName} and share your
          experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="reviewerName">Your Name (Anonymous)</Label>
          <Input
            id="reviewerName"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Your name will remain anonymous"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your name will not be shown publicly
          </p>
        </div>

        <div>
          <Label htmlFor="verificationMethod">Verification Method</Label>
          <Select
            value={verificationMethod}
            onValueChange={(value) =>
              setVerificationMethod(value as VerificationMethod)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Company Email Verification</SelectItem>
              <SelectItem value="linkedin">
                LinkedIn Connection (Optional)
              </SelectItem>
              <SelectItem value="document">Upload Document</SelectItem>
              <SelectItem value="receipt">Upload Receipt/Invoice</SelectItem>
              <SelectItem value="none">No Verification</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {verificationMethod === "none" &&
              "Your review will be marked as unverified"}
            {verificationMethod === "email" &&
              "We'll send a verification link to your email"}
            {verificationMethod === "linkedin" &&
              "Connect your LinkedIn account"}
            {verificationMethod === "document" &&
              "Upload a document proving your relationship"}
            {verificationMethod === "receipt" && "Upload a receipt or invoice"}
          </p>
        </div>

        {verificationMethod === "email" && (
          <div>
            <Label htmlFor="reviewerEmail">Email Address</Label>
            <Input
              id="reviewerEmail"
              type="email"
              value={reviewerEmail}
              onChange={(e) => setReviewerEmail(e.target.value)}
              placeholder="your.email@company.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Don't have a work email? Use your personal email.
            </p>
          </div>
        )}

        {(verificationMethod === "document" ||
          verificationMethod === "receipt") && (
          <div>
            <Label>Upload Document</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {verificationMethod === "document"
                  ? "Upload agreement, contract, or other document proving your relationship"
                  : "Upload receipt, invoice, or other proof of business relationship"}
              </p>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="experienceDescription">
            Describe Your Experience *
          </Label>
          <Textarea
            id="experienceDescription"
            value={experienceDescription}
            onChange={(e) => setExperienceDescription(e.target.value)}
            placeholder="Please describe your experience with this organization..."
            rows={4}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This helps provide context for your review
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuestionsStep = () => {
    const sections = getAvailableSections();

    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Questions</CardTitle>
          <CardDescription>
            Please answer the questions that apply to your role as a {role}. You
            can skip questions that don't apply by selecting "N/A".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-4">
            {sections.map((section) => {
              const questions = getQuestionsForSection(section.key);
              return (
                <AccordionItem
                  key={section.key}
                  value={section.key}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-4 py-3">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-semibold">{section.title}</span>
                      <Badge variant="outline">
                        {Math.round(section.weight * 100)}% weight
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4">
                    {questions.map((question) => (
                      <div key={question.id} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {question.question}
                        </Label>
                        <div className="flex gap-4">
                          {["yes", "no", "na"].map((option) => (
                            <label
                              key={option}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    question.id,
                                    e.target.value
                                  )
                                }
                                className="text-[#548281]"
                              />
                              <span className="text-sm capitalize">
                                {option === "na" ? "N/A" : option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  const renderDisclosureStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Anonymous Disclosure Agreement</CardTitle>
        <CardDescription>
          Please read and accept the following disclosure before submitting your
          review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm leading-relaxed">
            <strong>
              I confirm that everything I have provided in regards to{" "}
              {companyName} is true.
            </strong>{" "}
            My review will remain anonymous to the public and to all
            representatives of this organization. If I cannot verify my
            involvement with this organization, my review will still be publicly
            posted as an unverified comment, but it will not affect the
            company's rating or score.{" "}
            <strong>I accept and would like to continue.</strong>
          </p>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="disclosure"
            checked={signedDisclosure}
            onCheckedChange={(checked) =>
              setSignedDisclosure(checked as boolean)
            }
          />
          <label htmlFor="disclosure" className="text-sm leading-relaxed">
            I have read and agree to the anonymous disclosure agreement above.
          </label>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          Review Submitted Successfully!
        </CardTitle>
        <CardDescription>
          Thank you for contributing to the Peace Seal community.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            Your review has been submitted and will be processed. If you
            provided verification information, you may receive an email to
            confirm your relationship with {companyName}.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onComplete} className="flex-1">
            Continue to Directory
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case "role":
        return "Select Your Role";
      case "verification":
        return "Verification & Experience";
      case "questions":
        return "Review Questions";
      case "disclosure":
        return "Anonymous Disclosure";
      case "complete":
        return "Review Complete";
      default:
        return "Community Review";
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case "role":
        return 1;
      case "verification":
        return 2;
      case "questions":
        return 3;
      case "disclosure":
        return 4;
      case "complete":
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#2F4858]">
            {getStepTitle()}
          </h1>
          <div className="text-sm text-gray-500">
            Step {getStepNumber()} of 5
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#548281] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getStepNumber() / 5) * 100}%` }}
          />
        </div>
      </div>

      {currentStep === "role" && renderRoleStep()}
      {currentStep === "verification" && renderVerificationStep()}
      {currentStep === "questions" && renderQuestionsStep()}
      {currentStep === "disclosure" && renderDisclosureStep()}
      {currentStep === "complete" && renderCompleteStep()}

      {currentStep !== "complete" && (
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-[#548281] hover:bg-[#2F4858]"
          >
            {isSubmitting
              ? "Submitting..."
              : currentStep === "disclosure"
                ? "Submit Review"
                : "Next"}
          </Button>
        </div>
      )}
    </div>
  );
}
