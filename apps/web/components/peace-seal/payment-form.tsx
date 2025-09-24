"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Shield, CheckCircle } from "lucide-react";
import PeaceSealPayment from "./PeaceSealPayment";
import { logger } from "@/lib/utils/logger";
import DropInPayment from "@/components/donations/DropInPayment";

interface PaymentFormProps {
  amount: number;
  companyName: string;
  companyId: string;
  onSuccess: (result: { transactionId: string; amount: number }) => void;
  onError: (message: string) => void;
}

export default function PaymentForm({
  amount,
  companyName,
  companyId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
            <span className="text-2xl font-bold text-[#2F4858]">${amount}</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>
              Company: <span className="font-bold">{companyName}</span>
            </p>
            <p>Annual certification fee</p>
          </div>
        </div>

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
            amount={amount.toString()}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            clientToken={clientToken}
            peaceSealPayment={{
              companyName,
              companyId,
              createSubscription: true,
            }}
          />
        </div>

        {/* Payment Benefits */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
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
