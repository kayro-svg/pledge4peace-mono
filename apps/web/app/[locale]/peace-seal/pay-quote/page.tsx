"use client";

import { useState, useEffect } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserCompany } from "@/lib/api/peace-seal";
import PaymentForm from "@/components/peace-seal/peace-seal-apply/payment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";

export default function PayQuotePage() {
  const { status } = useAuthSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<{
    id: string;
    name: string;
    rfqStatus: string | null;
    rfqQuotedAmountCents: number | null;
  } | null>(null);

  const companyId = searchParams.get("companyId");
  const amountParam = searchParams.get("amount");

  useEffect(() => {
    const loadCompany = async () => {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        setError("You must be logged in to pay for a quote.");
        setLoading(false);
        return;
      }

      if (!companyId) {
        setError("Company ID is required.");
        setLoading(false);
        return;
      }

      if (!amountParam) {
        setError("Quote amount is required.");
        setLoading(false);
        return;
      }

      try {
        const companyData = await getUserCompany();

        if (companyData.id !== companyId) {
          setError("You can only pay for quotes for your own company.");
          setLoading(false);
          return;
        }

        if (companyData.rfqStatus !== "quoted") {
          setError(
            "No quote available for this company. Please request a quote first."
          );
          setLoading(false);
          return;
        }

        const amountCents = parseInt(amountParam, 10);
        if (isNaN(amountCents) || amountCents <= 0) {
          setError("Invalid quote amount.");
          setLoading(false);
          return;
        }

        // Verify the amount matches the quoted amount
        if (companyData.rfqQuotedAmountCents !== amountCents) {
          setError(
            "Quote amount mismatch. Please use the link provided in your quote notification."
          );
          setLoading(false);
          return;
        }

        setCompany({
          id: companyData.id,
          name: companyData.name,
          rfqStatus: companyData.rfqStatus,
          rfqQuotedAmountCents: companyData.rfqQuotedAmountCents,
        });
      } catch (err) {
        logger.error("Failed to load company:", err);
        setError("Failed to load company information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [status, companyId, amountParam]);

  const handlePaymentSuccess = async (result: {
    transactionId: string;
    amount: number;
  }) => {
    logger.log("Quote payment successful:", result);
    // Redirect to questionnaire or success page
    router.push(`/dashboard/company-peace-seal`);
  };

  const handlePaymentError = (message: string) => {
    logger.error("Quote payment error:", message);
    setError(`Payment failed: ${message}`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
              You need to be logged in to pay for a quote.
            </p>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || "Company not found"}</p>
            <div className="flex gap-2">
              <Link href="/dashboard/company-peace-seal" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amount = (company.rfqQuotedAmountCents || 0) / 100;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/company-peace-seal"
            className="inline-flex items-center text-[#548281] hover:text-[#2F4858] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-[#2F4858] mb-2">
            Complete Payment
          </h1>
          <p className="text-lg text-gray-600">
            Complete payment for your Peace Seal certification application
          </p>
        </div>

        {/* Success Message */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Your custom quote is ready!</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            After payment is confirmed, continue with the questionnaire to
            complete your application.
          </p>
        </div>

        {/* Payment Form */}
        <PaymentForm
          amount={amount}
          companyName={company.name}
          companyId={company.id}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          isQuotePayment={true}
        />
      </div>
    </main>
  );
}
