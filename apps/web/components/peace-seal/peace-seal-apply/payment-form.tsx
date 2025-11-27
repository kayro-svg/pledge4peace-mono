"use client";

import DropInPayment from "@/components/donations/DropInPayment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils/logger";
import { CheckCircle, CreditCard, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PaymentFormProps {
  amount: number; // Keep for display/backward compatibility
  companyName: string;
  companyId: string;
  onSuccess: (result: { transactionId: string; amount: number }) => void;
  onError: (message: string) => void;
  isQuotePayment?: boolean;
  tier?: "small" | "medium"; // New: tier for subscription payments
}

export default function PaymentForm({
  amount,
  companyName,
  companyId,
  onSuccess,
  onError,
  isQuotePayment = false,
  tier, // New: tier for subscription payments
}: PaymentFormProps) {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [displayAmount, setDisplayAmount] = useState(amount);

  // Check if discounts UI should be enabled (matches backend flag)
  const discountsUiEnabled =
    process.env.NEXT_PUBLIC_BT_DISCOUNTS_ENABLED === "true";

  // Update displayAmount when amount prop changes
  useEffect(() => {
    if (couponApplied) {
      setDisplayAmount(amount * 0.7);
    } else {
      setDisplayAmount(amount);
    }
  }, [amount, couponApplied]);

  // Fetch Braintree client token
  useEffect(() => {
    const fetchClientToken = async () => {
      try {
        const response = await fetch("/api/donations/client-token");
        const data = await response.json();

        if (data.clientToken) {
          setClientToken(data.clientToken);
        } else {
          onError("Failed to initialize payment system");
        }
      } catch (error) {
        logger.error("Failed to fetch client token:", error);
        onError("Failed to initialize payment system");
      } finally {
        setLoading(false);
      }
    };

    fetchClientToken();
  }, [onError]);

  const handlePaymentSuccess = (result: {
    transactionId: string;
    amount: number;
  }) => {
    logger.log("Peace Seal payment successful:", result);
    onSuccess(result);
  };

  const handlePaymentError = (message: string) => {
    logger.error("Peace Seal payment error:", message);
    onError(message);
  };

  const handleApplyCoupon = () => {
    const normalized = couponCode.trim().toUpperCase();
    setCouponError(null);

    if (!normalized) {
      setCouponApplied(false);
      setDisplayAmount(amount);
      return;
    }

    if (normalized === "CYBER30" && !isQuotePayment) {
      setCouponApplied(true);
      setDisplayAmount(amount * 0.7);
      setCouponError(null);
    } else {
      setCouponApplied(false);
      setDisplayAmount(amount);
      if (isQuotePayment) {
        setCouponError("Coupons are not available for quote payments");
      } else {
        setCouponError("Invalid coupon code");
      }
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponError(null);
    setDisplayAmount(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281]"></div>
        </CardContent>
      </Card>
    );
  }

  if (!clientToken) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600">
            Failed to initialize payment system. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Peace Seal Certification</span>
            <div className="text-right">
              {couponApplied ? (
                <>
                  <div className="text-sm text-gray-500 line-through">
                    ${amount.toFixed(2)}
                  </div>
                  <span className="text-2xl font-bold text-[#548281]">
                    ${displayAmount.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-[#2F4858]">
                  ${amount.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          {couponApplied && (
            <div className="mb-2 text-sm text-green-600 font-medium">
              Discount CYBER30 (-30%) applied
            </div>
          )}
          <div className="text-sm text-gray-600">
            <p>
              Company: <span className="font-bold">{companyName}</span>
            </p>
            <p>Annual certification fee</p>
          </div>
        </div>

        {/* Coupon Code Field - Only show for small/medium (not RFQ) and when discounts are enabled */}
        {!isQuotePayment && discountsUiEnabled && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Coupon Code (Optional)
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError(null);
                    if (couponApplied) {
                      setCouponApplied(false);
                      setDisplayAmount(amount);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {couponApplied ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveCoupon}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={loading || !couponCode.trim()}
                >
                  Apply
                </Button>
              )}
            </div>
            {couponError && (
              <p className="text-sm text-red-600">{couponError}</p>
            )}
            {couponApplied && (
              <p className="text-sm text-green-600 font-medium">
                ✓ Coupon applied successfully!
              </p>
            )}
          </div>
        )}

        {/* Peace Seal Payment Component */}
        <div>
          {/* <PeaceSealPayment
            amount={amount}
            companyName={companyName}
            companyId={companyId}
            clientToken={clientToken}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            createSubscription={true} // Set to true to enable annual subscriptions
          /> */}
          <DropInPayment
            amount={displayAmount.toFixed(2)}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            clientToken={clientToken}
            peaceSealPayment={{
              companyName,
              companyId,
              createSubscription: true,
              isQuotePayment,
              couponCode: couponApplied
                ? couponCode.trim().toUpperCase()
                : undefined,
              tier, // Send tier for subscription payments (backend will use this to determine base amount)
            }}
          />
        </div>

        {/* Payment Benefits */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">
            What&apos;s included:
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Comprehensive ethical practices audit
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Peace Seal certification badge
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Public directory listing
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Annual certification maintenance
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Dedicated advisor support
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
