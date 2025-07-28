"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, CircleDollarSign } from "lucide-react";
import dropin, { type Dropin } from "braintree-web-drop-in";
import { injectDropinOverrides } from "@/utils/injectDropinOverrides";

interface Props {
  amount: string;
  onSuccess: (res: any) => void;
  onError: (err: string) => void;
  clientToken: string;
  isRecurring?: boolean;
}

export default function DropInPayment({
  amount,
  onSuccess,
  onError,
  clientToken,
  isRecurring = false,
}: Props) {
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

      // Asegura contenedor vacío
      hostRef.current.innerHTML = "";

      try {
        dropinInstance = (await dropin.create({
          authorization: clientToken,
          container: hostRef.current,
          locale: "en_US", // keep UI in English

          // Order: PayPal first, then Card
          paymentOptionPriority: ["card", "paypal"],

          card: {
            cardholderName: { required: false },
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
            flow: isRecurring ? "vault" : "checkout",
            amount,
            currency: "USD",
            buttonStyle: {
              color: "gold",
              shape: "pill",
              layout: "horizontal",
              height: 40,
            } as any,
          },
          ...(isRecurring ? {} : { threeDSecure: { amount } }),

          translations: {
            chooseAnotherWayToPay: "Choose another method",
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
  }, [clientToken, isRecurring, amount]);

  const handlePayment = useCallback(async () => {
    if (!dropinRef.current) {
      onError("Payment form not ready");
      return;
    }
    setProcessing(true);
    try {
      const { nonce } = await dropinRef.current.requestPaymentMethod();
      const endpoint = isRecurring
        ? "/api/donations/recurring"
        : "/api/donations/one-time";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nonce,
          amount,
          paymentMethod: "card_or_paypal",
        }),
      });
      const json = await res.json();
      json.success
        ? onSuccess(json)
        : onError(json.message || "Payment failed");
    } catch (err: any) {
      onError(err.message || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  }, [amount, isRecurring, onSuccess, onError]);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <CircleDollarSign className="w-12 h-12 mx-auto mb-2" />
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
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CreditCard className="w-6 h-6 text-green-600" />
        <div>
          <h3 className="font-semibold text-green-900">
            {isRecurring ? "Monthly Payment" : "Secure Payment"}
          </h3>
          <p className="text-sm text-green-700">
            {isRecurring
              ? "Set up recurring monthly donations with cards or PayPal"
              : "Pay securely with credit cards or PayPal"}
          </p>
        </div>
      </div>
      {/* Drop-in container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#86AC9D] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-[#2F4858]">Loading payment form...</p>
            </div>
          </div>
        )}
        <div
          ref={hostRef}
          className={`min-h-[300px] ${loading ? "opacity-50" : ""} dropin-wrapper`}
        />
      </div>
      {/* Pay button */}
      <Button
        onClick={handlePayment}
        disabled={loading || processing}
        className="w-full h-12 text-lg"
      >
        {processing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing…
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {isRecurring
              ? `Start Monthly Donation – $${amount}/month`
              : `Donate $${amount} Now`}
          </div>
        )}
      </Button>
      <div className="text-center text-sm text-[#2F4858]/70">
        <p>
          We accept Visa, MasterCard, American Express, Discover, and PayPal
        </p>
        {isRecurring && (
          <p className="mt-1">
            You can cancel your monthly donation at any time
          </p>
        )}
      </div>
    </div>
  );
}
