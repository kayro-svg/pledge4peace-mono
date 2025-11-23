"use client";

import { useState, useMemo } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { requestQuote, startApplication } from "@/lib/api/peace-seal";
import PaymentForm from "@/components/peace-seal/peace-seal-apply/payment-form";
import { QuoteNotice } from "@/components/peace-seal/peace-seal-apply/quote-notice";
import QuestionnaireForm from "@/components/peace-seal/questionnaire/QuestionnaireForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  PEACE_SEAL_INDUSTRIES,
  BUSINESS_SIZE_OPTIONS,
  businessSizeToNumber,
  requiresRFQ,
  type BusinessSize,
} from "@/lib/utils/peace-seal-utils";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

interface ApplyPageProps {
  initialUserData?: {
    userType: string | null;
    organization: string | null;
    nonprofit: string | null;
    institution: string | null;
    otherRole: string | null;
    office: string | null;
  } | null;
}

interface CompanyForm {
  name: string;
  country: string;
  website: string;
  industry: string;
  businessSize: BusinessSize | "";
}

export default function ApplyPage({ initialUserData }: ApplyPageProps) {
  const { status, session } = useAuthSession();
  const user = session?.user;
  const userEmail = user?.email;

  const organization = initialUserData?.organization;
  const nonprofit = initialUserData?.nonprofit;
  const institution = initialUserData?.institution;
  const otherRole = initialUserData?.otherRole;
  const office = initialUserData?.office;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);

  // Form data
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    name: organization || nonprofit || institution || otherRole || office || "",
    country: "",
    website: "",
    industry: "",
    businessSize: "",
  });

  const [application, setApplication] = useState<{
    id: string;
    slug: string;
  } | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Calculate price based on business size
  const price = useMemo(() => {
    if (!companyForm.businessSize) return 99; // Default to small company
    if (companyForm.businessSize === "small") return 99;
    if (companyForm.businessSize === "medium") return 499;
    return null; // RFQ for large businesses
  }, [companyForm.businessSize]);

  // Check if all required fields are filled
  const isStep1Valid = useMemo(() => {
    return (
      companyForm.name.trim() !== "" &&
      companyForm.country !== "" &&
      companyForm.industry !== "" &&
      companyForm.businessSize !== ""
    );
  }, [
    companyForm.name,
    companyForm.country,
    companyForm.industry,
    companyForm.businessSize,
  ]);

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You need to be logged in to apply for Peace Seal certification.
            </p>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStep1Submit = async () => {
    if (!isStep1Valid) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Convert business size to numeric value for backend compatibility
      const employeeCount = businessSizeToNumber(companyForm.businessSize);

      const result = await startApplication({
        name: companyForm.name,
        country: companyForm.country || undefined,
        website: companyForm.website || undefined,
        industry: companyForm.industry || undefined,
        employeeCount: employeeCount || undefined,
        businessSize: companyForm.businessSize || undefined,
      });

      setApplication(result);
      setStep(2); // Move to questionnaire step
    } catch (error) {
      console.error("Failed to start application:", error);
      toast.error("Failed to start application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!application) return;

    setLoading(true);
    try {
      // The backend's confirmPaymentWebhook is now called by the Braintree webhook,
      // so we just need to update the frontend state.
      // Payment is complete, application is now submitted for review
      setPaymentCompleted(true);
      // Show success message and redirect to dashboard or success page
      toast.success(
        "Payment confirmed! Your application has been submitted for review. You can track its status anytime from your dashboard under “Peace Seal Certification”."
      );
      // Optionally redirect to dashboard
      // window.location.href = `/dashboard/company-peace-seal`;
    } catch (error) {
      console.error("Failed to confirm payment (frontend update):", error);
      toast.error(
        "Payment was processed but confirmation failed. Please contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (message: string) => {
    toast.error(`Payment failed: ${message}`);
  };

  const handleQuestionnaireComplete = async (data: unknown) => {
    console.log("Questionnaire completed:", data);
    // Move to payment step
    setStep(3);
  };

  const handleRequestQuote = async () => {
    if (!application) return;
    try {
      const employeeCount =
        businessSizeToNumber(companyForm.businessSize) || 100;
      await requestQuote(application.id, employeeCount);
      setLoading(true);
      // After requesting quote, show success message
      toast.success(
        "Quote request submitted! You will be notified once your custom quote is ready. You can complete payment then."
      );
      // Optionally redirect to dashboard
      // window.location.href = `/dashboard/company-peace-seal`;
    } catch (error) {
      console.error("Failed to request quote:", error);
      toast.error("Failed to request quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/peace-seal/directory"
            className="inline-flex items-center text-[#548281] hover:text-[#2F4858] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>
          <h1 className="text-4xl font-bold text-[#2F4858] mb-2">
            Apply for Peace Seal
          </h1>
          <p className="text-lg text-gray-600">
            Join businesses committed to ethical practices, nonviolence, and
            social impact.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`flex items-center ${step >= 1 ? "text-[#548281]" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-[#548281] text-white" : "bg-gray-200"}`}
              >
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <span className="ml-2 font-medium">Company Info</span>
            </div>
            <div
              className={`flex items-center ${step >= 2 ? "text-[#548281]" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-[#548281] text-white" : "bg-gray-200"}`}
              >
                {step > 2 ? <CheckCircle className="w-5 h-5" /> : "2"}
              </div>
              <span className="ml-2 font-medium">Questionnaire</span>
            </div>
            <div
              className={`flex items-center ${step >= 3 ? "text-[#548281]" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-[#548281] text-white" : "bg-gray-200"}`}
              >
                {step > 3 ? <CheckCircle className="w-5 h-5" /> : "3"}
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Company Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Basic Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={companyForm.name}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">
                    Country of Registration & Operations
                  </Label>
                  <Popover
                    open={countryPopoverOpen}
                    onOpenChange={setCountryPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryPopoverOpen}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#548281] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {companyForm.country || "Select country..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {COUNTRIES.map((country) => (
                              <CommandItem
                                key={country}
                                value={country}
                                onSelect={() => {
                                  setCompanyForm((prev) => ({
                                    ...prev,
                                    country: country,
                                  }));
                                  setCountryPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    companyForm.country === country
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {country}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={companyForm.industry}
                    onValueChange={(value) =>
                      setCompanyForm((prev) => ({
                        ...prev,
                        industry: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PEACE_SEAL_INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={companyForm.website}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="businessSize">Business Size *</Label>
                  <Select
                    value={companyForm.businessSize}
                    onValueChange={(value) =>
                      setCompanyForm((prev) => ({
                        ...prev,
                        businessSize: value as BusinessSize,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business size..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleStep1Submit}
                  disabled={loading || !isStep1Valid}
                  className="flex items-center gap-2"
                >
                  {loading ? "Creating..." : "Continue to Questionnaire"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Questionnaire */}
        {step === 2 && application && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">
                Your questionnaire progress is saved automatically.
              </p>
              <p className="text-xs text-blue-800 mt-1">
                You can complete it now or return later from your dashboard in
                the <span className="font-semibold">Peace Seal</span> tab.
              </p>
            </div>

            <QuestionnaireForm
              companyId={application.id}
              onComplete={handleQuestionnaireComplete}
              employeeCount={
                businessSizeToNumber(companyForm.businessSize) || 0
              }
              initialData={{
                companyInformation: {
                  organizationName: companyForm.name,
                  website: companyForm.website,
                  headquartersCountry: companyForm.country,
                  employeeCount:
                    businessSizeToNumber(companyForm.businessSize) || 0,
                  contactEmail: userEmail,
                  // Note: industry field may need to be mapped to appropriate field in questionnaire
                },
              }}
              submitLabel="Continue with payment"
              submitIcon="arrow"
            />

            {/* Back button */}
            {/* <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Company Info
              </Button>
            </div> */}
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && application && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {paymentCompleted
                    ? "Payment completed! Your application is now in review."
                    : "Questionnaire completed! Complete payment to submit your application for review."}
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                {paymentCompleted
                  ? "You can follow the progress of your Peace Seal application anytime from your dashboard under “Peace Seal Certification”."
                  : "Your questionnaire has been saved. Complete payment below to finalize your Peace Seal application submission."}
              </p>
              <Link
                href="/dashboard/company-peace-seal"
                className="text-green-700 text-sm mt-1 flex items-center gap-2 w-full justify-end hover:text-green-800 group"
              >
                <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                Go to Dashboard
              </Link>
            </div>

            {!paymentCompleted &&
              (requiresRFQ(companyForm.businessSize) ? (
                <QuoteNotice onRequestQuote={handleRequestQuote} />
              ) : (
                <PaymentForm
                  amount={price || 0}
                  companyName={companyForm.name}
                  companyId={application.id}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              ))}

            {/* Back button */}
            {!paymentCompleted && (
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Questionnaire
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
