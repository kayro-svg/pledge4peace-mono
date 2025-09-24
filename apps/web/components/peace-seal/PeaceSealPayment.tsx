"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils/logger";
import { injectDropinOverrides } from "@/utils/injectDropinOverrides";
import dropin, { type Dropin } from "braintree-web-drop-in";
import { CreditCard, Shield } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  amount: number;
  companyName: string;
  companyId: string;
  clientToken: string;
  onSuccess: (result: { transactionId: string; amount: number }) => void;
  onError: (message: string) => void;
  createSubscription?: boolean;
}

export default function PeaceSealPayment({
  amount,
  companyName,
  companyId,
  clientToken,
  onSuccess,
  onError,
  createSubscription = true,
}: Props) {
  const enable3DS = process.env.NEXT_PUBLIC_ENABLE_3DS === "false";
  const hostRef = useRef<HTMLDivElement>(null);
  const dropinRef = useRef<Dropin | null>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let dropinInstance: Dropin | null = null;

    const mountDropin = async () => {
      if (!hostRef.current) return;

      // Clear container
      hostRef.current.innerHTML = "";

      try {
        dropinInstance = (await dropin.create({
          authorization: clientToken,
          container: hostRef.current,
          locale: "en_US",

          // Focus on cards and PayPal for business payments
          paymentOptionPriority: ["card", "paypal"],

          card: {
            cardholderName: {
              required: true,
            },
            overrides: {
              styles: {
                input: {
                  color: "#2F4858 !important",
                  "font-size": "16px !important",
                  "font-family": "Inter, sans-serif !important",
                  border: "1px solid #86AC9D !important",
                  "border-radius": "6px !important",
                  padding: "0.75rem !important",
                },
                ".number, .expirationDate, .cvv": {
                  "letter-spacing": "0.05em",
                },
                ":focus": {
                  color: "#2F4858 !important",
                  "border-color": "#2F4858 !important",
                },
                ".invalid": {
                  color: "#dc2626 !important",
                  "border-color": "#dc2626 !important",
                },
                ".valid": {
                  "border-color": "#16a34a !important",
                },
                "::placeholder": {
                  color: "#64858F !important",
                  opacity: "0.6 !important",
                },
              },
              fields: {
                number: { placeholder: "XXXX XXXX XXXX XXXX" },
                cvv: { placeholder: "XXX" },
                expirationDate: { placeholder: "MM / YY" },
              },
            },
          },

          paypal: {
            flow: createSubscription ? "vault" : "checkout",
            amount: amount.toString(),
            currency: "USD",
            buttonStyle: {
              color: "blue",
              shape: "rect",
              layout: "horizontal",
              height: 44,
              label: "pay",
            } as any,
          },
          ...(!createSubscription && enable3DS
            ? { threeDSecure: { amount: amount.toString() } }
            : {}),

          // Enable 3D Secure for higher transaction amounts
          //   ...(amount >= 500
          //     ? { threeDSecure: { amount: amount.toString() } }
          //     : {}),

          translations: {
            chooseAnotherWayToPay: "Choose another payment method",
            payingWith: "Paying with {{paymentSource}}",
          },
        })) as unknown as Dropin;

        dropinRef.current = dropinInstance;
        injectDropinOverrides();
        if (!cancelled) setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load payment form");
          setLoading(false);
        }
      }
    };

    mountDropin();

    return () => {
      cancelled = true;
      if (dropinInstance) {
        dropinInstance.teardown().catch(() => {});
        dropinRef.current = null;
        if (hostRef.current) hostRef.current.innerHTML = "";
      }
    };
  }, [clientToken, amount, createSubscription]);

  const handlePayment = useCallback(async () => {
    if (!dropinRef.current) {
      onError("Payment form not ready");
      return;
    }

    setProcessing(true);

    try {
      // Get payment method nonce from Drop-in
      const { nonce } = await dropinRef.current.requestPaymentMethod();

      logger.log("Processing Peace Seal payment with nonce:", {
        companyId,
        amount,
      });

      // Process with Peace Seal endpoint
      const response = await fetch("/api/peace-seal/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nonce,
          amount,
          companyName,
          companyId,
          createSubscription,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess({
          transactionId: result.transactionId || result.subscriptionId,
          amount: result.amount,
        });
      } else {
        onError(result.message || "Payment failed");
      }
    } catch (err: any) {
      logger.error("Peace Seal payment error:", err);
      onError(err.message || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  }, [amount, createSubscription, onSuccess, onError]);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <CreditCard className="w-12 h-12 mx-auto mb-2" />
          <p className="font-semibold">Payment Form Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => {
            setError(null);
            setLoading(true);
            window.location.reload();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-blue-800 mb-1">
            Secure Business Payment
          </p>
          <p className="text-blue-700">
            Your payment is processed securely through Braintree (PayPal).
            {createSubscription &&
              " This will set up annual automatic renewals."}
          </p>
        </div>
      </div>

      {/* Drop-in container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#86AC9D] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-[#2F4858]">
                Loading secure payment form...
              </p>
            </div>
          </div>
        )}
        <div
          ref={hostRef}
          className={`min-h-[350px] ${loading ? "opacity-50" : ""} peace-seal-dropin`}
        />
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={loading || processing}
        className="w-full h-12 text-lg bg-[#2F4858] hover:bg-[#1f3240]"
      >
        {processing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {createSubscription
              ? `Pay $${amount} & Setup Annual Renewal`
              : `Pay $${amount} for Peace Seal Certification`}
          </div>
        )}
      </Button>

      {/* Processing State */}
      {processing && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-600">
            Processing your payment securely... This may take a moment.
          </p>
        </div>
      )}

      {/* Payment Info */}
      <div className="text-center text-sm text-[#2F4858]/70">
        <p>
          We accept Visa, MasterCard, American Express, Discover, and PayPal
        </p>
        <p className="mt-1">
          {createSubscription
            ? "Annual subscription - you can cancel anytime from your dashboard"
            : "One-time certification fee"}
        </p>
      </div>
    </div>
  );
}
