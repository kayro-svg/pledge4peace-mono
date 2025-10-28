"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Upload, CheckCircle } from "lucide-react";
import { LinkedInVerificationModal } from "@/components/peace-seal/linkedin-verification-modal";

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // LinkedIn verification state
  const [linkedinVerified, setLinkedinVerified] = useState(false);
  const [linkedinIdToken, setLinkedinIdToken] = useState<string | null>(null);
  const [linkedinAccessToken, setLinkedinAccessToken] = useState<string | null>(
    null
  );
  const [linkedinModalOpen, setLinkedinModalOpen] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedFile(file);
  };

  // Get available verification methods based on role
  const getVerificationMethods = useCallback(() => {
    switch (role) {
      case "employee":
        return [
          {
            value: "email",
            label: "Company Email Verification",
            description:
              "We'll send a verification link to your work email. Don't have one? Use your personal email.",
          },
          {
            value: "linkedin",
            label: "LinkedIn Verification",
            description:
              "Log in via LinkedIn, must have the company listed in work history.",
          },
          {
            value: "none",
            label: "No Verification",
            description:
              "Your review will be marked as unverified and will not affect the company's rating.",
          },
        ];
      case "customer":
        return [
          {
            value: "receipt",
            label: "Upload Receipt/Invoice",
            description:
              "Upload a receipt or invoice that proves you have been a customer.",
          },
          {
            value: "none",
            label: "No Verification",
            description:
              "Your review will be marked as unverified and will not affect the company's rating.",
          },
        ];
      case "investor":
        return [
          {
            value: "document",
            label: "Upload Investment Agreement",
            description:
              "Upload an agreement that proves you have been an investor.",
          },
          {
            value: "none",
            label: "No Verification",
            description:
              "Your review will be marked as unverified and will not affect the company's rating.",
          },
        ];
      case "supplier":
        return [
          {
            value: "document",
            label: "Upload Supplier Agreement",
            description:
              "Upload an agreement that proves you have been a supplier.",
          },
          {
            value: "none",
            label: "No Verification",
            description:
              "Your review will be marked as unverified and will not affect the company's rating.",
          },
        ];
      default:
        return [
          {
            value: "none",
            label: "No Verification",
            description: "Review will be posted as unverified.",
          },
        ];
    }
  }, [role]);

  // Restore form state after LinkedIn OAuth redirect
  useEffect(() => {
    const savedState = localStorage.getItem("communityReviewFormState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setCurrentStep(state.currentStep);
        setRole(state.role);
        setVerificationMethod(state.verificationMethod);
        setReviewerName(state.reviewerName);
        setReviewerEmail(state.reviewerEmail);
        setExperienceDescription(state.experienceDescription);
        setAnswers(state.answers);
        // Don't restore uploadedFile as it's a File object

        // Clean up
        localStorage.removeItem("communityReviewFormState");
      } catch (error) {
        console.error("Error restoring form state:", error);
      }
    }
  }, []);

  // Reset verification method when role changes (if current method is not available for new role)
  useEffect(() => {
    if (role && currentStep === "verification") {
      const availableMethods = getVerificationMethods().map((m) => m.value);
      if (!availableMethods.includes(verificationMethod)) {
        // Reset to first available method
        setVerificationMethod(availableMethods[0] as VerificationMethod);
        // Reset verification state
        setLinkedinVerified(false);
        setLinkedinIdToken(null);
        setLinkedinAccessToken(null);
        setUploadedFile(null);
      }
    }
  }, [role, currentStep, verificationMethod, getVerificationMethods]);

  // Check for LinkedIn verification callback
  useEffect(() => {
    // Check URL parameters for LinkedIn verification result
    const urlParams = new URLSearchParams(window.location.search);
    const linkedinVerifiedParam = urlParams.get("linkedin_verified");
    const linkedinEmailParam = urlParams.get("linkedin_email");
    const linkedinError = urlParams.get("linkedin_error");

    if (linkedinError) {
      toast({
        title: "LinkedIn verification failed",
        description: `Error: ${linkedinError}. Please try again.`,
        variant: "destructive",
      });
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("linkedin_error");
      window.history.replaceState({}, "", newUrl.toString());
      localStorage.removeItem("reviewerEmailForLinkedIn");
      return;
    }

    if (
      linkedinVerifiedParam === "true" &&
      linkedinEmailParam &&
      verificationMethod === "linkedin" &&
      !linkedinVerified
    ) {
      const expectedEmail = (
        reviewerEmail ||
        localStorage.getItem("reviewerEmailForLinkedIn") ||
        ""
      )
        .trim()
        .toLowerCase();
      const actualEmail = linkedinEmailParam.trim().toLowerCase();

      if (actualEmail === expectedEmail) {
        // Extract tokens from URL hash
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const idToken = hashParams.get("idToken") || "";
        const accessToken = hashParams.get("accessToken") || "";

        // Verification successful
        setLinkedinVerified(true);
        setLinkedinIdToken(idToken);
        setLinkedinAccessToken(accessToken);
        toast({
          title: "LinkedIn verified",
          description: "Your LinkedIn account has been verified successfully.",
        });

        // Clean up URL and localStorage
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("linkedin_verified");
        newUrl.searchParams.delete("linkedin_email");
        newUrl.searchParams.delete("linkedin_sub");
        newUrl.hash = "";
        window.history.replaceState({}, "", newUrl.toString());
        localStorage.removeItem("reviewerEmailForLinkedIn");
      } else {
        // Email mismatch
        toast({
          title: "Email mismatch",
          description: `LinkedIn email (${linkedinEmailParam}) does not match the entered email.`,
          variant: "destructive",
        });

        // Clean up URL and localStorage
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("linkedin_verified");
        newUrl.searchParams.delete("linkedin_email");
        newUrl.searchParams.delete("linkedin_sub");
        newUrl.hash = "";
        window.history.replaceState({}, "", newUrl.toString());
        localStorage.removeItem("reviewerEmailForLinkedIn");
      }
    }
  }, [verificationMethod, reviewerEmail, linkedinVerified, toast]);

  // Save form state before LinkedIn verification
  const saveFormState = () => {
    const state = {
      currentStep,
      role,
      verificationMethod,
      reviewerName,
      reviewerEmail,
      experienceDescription,
      answers,
    };
    localStorage.setItem("communityReviewFormState", JSON.stringify(state));
  };

  const handleLinkedInVerify = () => {
    if (!reviewerEmail.trim()) {
      toast({
        title: "Please enter your email first",
        variant: "destructive",
      });
      return;
    }
    setLinkedinModalOpen(true);
  };

  const handleLinkedInVerificationComplete = (
    idToken: string,
    accessToken: string
  ) => {
    setLinkedinVerified(true);
    setLinkedinIdToken(idToken);
    setLinkedinAccessToken(accessToken);
    toast({
      title: "LinkedIn verified",
      description: "Your LinkedIn account has been verified successfully.",
    });
  };

  const handleLinkedInVerificationError = (error: string) => {
    toast({
      title: "LinkedIn verification failed",
      description: error,
      variant: "destructive",
    });
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
        if (verificationMethod === "linkedin") {
          if (!reviewerEmail.trim()) {
            toast({
              title: "Please enter your email for verification",
              variant: "destructive",
            });
            return;
          }
          if (!linkedinVerified) {
            toast({
              title: "Please verify with LinkedIn first",
              variant: "destructive",
            });
            return;
          }
        }
        if (
          (verificationMethod === "document" ||
            verificationMethod === "receipt") &&
          !uploadedFile
        ) {
          toast({
            title: "Please upload a document for verification",
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
      case "questions": {
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
      }
      case "disclosure": {
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
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // If there's a file to upload, upload it first
      let uploadedFileUrl: string | undefined;
      if (
        uploadedFile &&
        (verificationMethod === "document" || verificationMethod === "receipt")
      ) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("companyId", companyId);
        formData.append("documentType", verificationMethod);
        formData.append("sectionId", "community-review");
        formData.append("fieldId", "verification-document");

        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api"}/peace-seal/reviews/upload-document`,
          {
            method: "POST",
            body: formData,
            // No authentication headers needed for anonymous community reviews
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload verification document");
        }

        const uploadResult = await uploadResponse.json();
        uploadedFileUrl = uploadResult.fileUrl;
      }

      const reviewData: CreateReviewData = {
        companyId,
        role: role as ReviewRole,
        verificationMethod,
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim() || undefined,
        signedDisclosure: true,
        answers,
        verificationDocumentUrl: uploadedFileUrl,
        experienceDescription: experienceDescription.trim(),
        ...(linkedinVerified &&
          linkedinIdToken &&
          linkedinAccessToken && {
            oidcIdToken: linkedinIdToken,
            oidcAccessToken: linkedinAccessToken,
          }),
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
          which aspects you&apos;ll be asked to review.
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
            Your name will not be shown publicly. This is required per the
            anonymous disclosure agreement.
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
              {getVerificationMethods().map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {
              getVerificationMethods().find(
                (m) => m.value === verificationMethod
              )?.description
            }
          </p>
        </div>

        {(verificationMethod === "email" ||
          verificationMethod === "linkedin") && (
          <div>
            <Label htmlFor="reviewerEmail">
              {role === "employee" ? "Email Address" : "Your Email Address"}
            </Label>
            <Input
              id="reviewerEmail"
              type="email"
              value={reviewerEmail}
              onChange={(e) => setReviewerEmail(e.target.value)}
              placeholder={
                role === "employee"
                  ? "your.email@company.com"
                  : "your.email@example.com"
              }
              required
              disabled={linkedinVerified}
            />
            <p className="text-xs text-gray-500 mt-1">
              {verificationMethod === "email" && role === "employee"
                ? "Use your company email if available. Don't have a work email? You can use your personal email."
                : verificationMethod === "linkedin" && role === "employee"
                  ? "We will verify that the LinkedIn account email matches the one you entered and that the company is listed in your work history."
                  : "Enter the email address you want to use for verification."}
            </p>
          </div>
        )}

        {verificationMethod === "linkedin" && (
          <div>
            <Label>LinkedIn Verification</Label>
            {linkedinVerified ? (
              <div className="border border-green-500 bg-green-50 rounded-lg p-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">
                  LinkedIn account verified successfully
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={handleLinkedInVerify}
                  className="w-full bg-[#0077b5] hover:bg-[#005885]"
                >
                  Verify with LinkedIn
                </Button>
                <p className="text-xs text-gray-500">
                  We will verify that the LinkedIn account email matches the one
                  you entered. LinkedIn may not always share email; if that
                  happens, please try again.
                </p>
              </div>
            )}
          </div>
        )}

        {(verificationMethod === "document" ||
          verificationMethod === "receipt") && (
          <div>
            <Label>
              {verificationMethod === "receipt"
                ? "Upload Receipt/Invoice"
                : role === "investor"
                  ? "Upload Investment Agreement"
                  : "Upload Supplier Agreement"}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="verification-file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label htmlFor="verification-file" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {uploadedFile
                    ? uploadedFile.name
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {verificationMethod === "receipt"
                    ? `Upload a receipt or invoice that proves you have been a customer of ${companyName}`
                    : role === "investor"
                      ? `Upload an agreement that proves you have been an investor at ${companyName}`
                      : `Upload an agreement that proves you have been a supplier for ${companyName}`}
                </p>
                {uploadedFile && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ File selected: {uploadedFile.name} (
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </label>
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
            This helps provide context for your review. This is mandatory per
            the requirements.
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
            can skip questions that don&apos;t apply by selecting
            &quot;N/A&quot;.
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
                      <span className="font-semibold text-2xl">
                        {section.title}
                      </span>
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
            company&apos;s rating or score.{" "}
            <strong>I accept and would like to continue.</strong>
          </p>
          <p className="text-xs text-gray-600 mt-2">
            This is the mandatory anonymous disclosure agreement as specified in
            the requirements.
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
            This is required to submit the review.
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
            confirm your relationship with {companyName}. Your review will be
            posted publicly as specified in the requirements.
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

      {/* LinkedIn Verification Modal */}
      <LinkedInVerificationModal
        open={linkedinModalOpen}
        onOpenChange={setLinkedinModalOpen}
        expectedEmail={reviewerEmail}
        onVerificationComplete={handleLinkedInVerificationComplete}
        onVerificationError={handleLinkedInVerificationError}
        onBeforeOAuth={saveFormState}
      />
    </div>
  );
}
