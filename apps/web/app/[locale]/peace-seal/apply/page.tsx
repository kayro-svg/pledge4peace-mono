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
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

type Step = 1 | 2 | 3;

interface CompanyForm {
  name: string;
  country: string;
  website: string;
  industry: string;
  employeeCount: number;
}

export default function ApplyPage() {
  const { status } = useAuthSession();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    name: "",
    country: "",
    website: "",
    industry: "",
    employeeCount: 0,
  });

  const [application, setApplication] = useState<{
    id: string;
    slug: string;
  } | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Calculate price based on employee count
  const price = useMemo(() => {
    const count = Number(companyForm.employeeCount);
    if (count <= 0) return 99; // Default to small company
    if (count <= 20) return 99;
    if (count <= 50) return 499;
    return null; // RFQ for >50 employees
  }, [companyForm.employeeCount]);

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
    if (!companyForm.name.trim()) {
      alert("Company name is required");
      return;
    }

    setLoading(true);
    try {
      const result = await startApplication({
        name: companyForm.name,
        country: companyForm.country || undefined,
        website: companyForm.website || undefined,
        industry: companyForm.industry || undefined,
        employeeCount: companyForm.employeeCount || undefined,
      });

      setApplication(result);
      setStep(2);
    } catch (error) {
      console.error("Failed to start application:", error);
      alert("Failed to start application. Please try again.");
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
      // No direct call to confirmPayment API from here anymore.
      setPaymentCompleted(true);
      setStep(3);
    } catch (error) {
      console.error("Failed to confirm payment (frontend update):", error);
      alert(
        "Payment was processed but confirmation failed. Please contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (message: string) => {
    alert(`Payment failed: ${message}`);
  };

  const handleQuestionnaireComplete = async (data: unknown) => {
    console.log("Questionnaire completed:", data);
    // Here you could redirect to a success page or show a completion message
    alert(
      "Questionnaire completed successfully! Your application is now under review."
    );
  };

  const handleRequestQuote = async () => {
    if (!application) return;
    try {
      await requestQuote(application.id, companyForm.employeeCount);
      setLoading(true);
      setStep(3);
    } catch (error) {
      console.error("Failed to request quote:", error);
      alert("Failed to request quote. Please try again.");
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
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <div
              className={`flex items-center ${step >= 3 ? "text-[#548281]" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-[#548281] text-white" : "bg-gray-200"}`}
              >
                {step > 3 ? <CheckCircle className="w-5 h-5" /> : "3"}
              </div>
              <span className="ml-2 font-medium">Questionnaire</span>
            </div>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Company Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Company Information
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
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={companyForm.country}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="e.g., United States"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={companyForm.industry}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    placeholder="e.g., Technology"
                  />
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
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    min="1"
                    value={companyForm.employeeCount || ""}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({
                        ...prev,
                        employeeCount: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="e.g., 25"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleStep1Submit}
                  disabled={loading || !companyForm.name.trim()}
                  className="flex items-center gap-2"
                >
                  {loading ? "Creating..." : "Continue to Payment"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Payment */}
        {step === 2 && application && (
          <div className="space-y-4">
            {companyForm.employeeCount > 50 ? (
              <QuoteNotice onRequestQuote={handleRequestQuote} />
            ) : (
              <PaymentForm
                amount={price || 0}
                companyName={companyForm.name}
                companyId={application.id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}

            {/* Back button */}
            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Company Info
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Questionnaire */}
        {step === 3 && (
          <div className="space-y-4">
            {paymentCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Payment confirmed! Complete the comprehensive questionnaire
                    below to finish your application.
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  The questionnaire covers 15 sections and will be used to
                  evaluate your peace seal certification.
                </p>
              </div>
            )}

            <QuestionnaireForm
              companyId={application?.id || ""}
              onComplete={handleQuestionnaireComplete}
              employeeCount={companyForm.employeeCount}
              initialData={{
                companyInformation: {
                  organizationName: companyForm.name,
                  website: companyForm.website,
                  countryOfRegistration: companyForm.country,
                  employeeCount: companyForm.employeeCount,
                  // Note: industry field may need to be mapped to appropriate field in questionnaire
                },
              }}
            />

            {/* Link to public profile */}
            {application?.slug && (
              <div className="text-center pt-4">
                <Link
                  href={`/peace-seal/company/${application.slug}`}
                  className="text-[#548281] hover:underline"
                >
                  View your public company profile →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
