"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  Repeat,
  CheckCircle,
  Building2,
  CreditCard,
  HeartPlus,
  AlertCircle,
} from "lucide-react";
import ACHPayment from "./ACHPayment";
import DropInPayment from "./DropInPayment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthSession } from "@/hooks/use-auth-session";
import { logger } from "@/lib/utils/logger";

type DonationType = "one-time" | "recurring";
type PaymentMethod = "ach" | "card-paypal";
type PaymentStep = "amount" | "payment" | "success";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [donationType, setDonationType] = useState<DonationType>("one-time");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("card-paypal");
  const [currentStep, setCurrentStep] = useState<PaymentStep>("amount");
  const [amount, setAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [clientToken, setClientToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { session, isAuthenticated } = useAuthSession();
  const [donorInfo, setDonorInfo] = useState({
    firstName: session?.user?.name?.split(" ")[0] || "",
    lastName: session?.user?.name?.split(" ")[1] || "",
    email: session?.user?.email || "",
    isAnonymous: false,
  });

  // Prefill donor info when the user is authenticated or when session changes
  useEffect(() => {
    if (isAuthenticated && session?.user) {
      setDonorInfo((prev) => ({
        ...prev,
        firstName: session.user.name?.split(" ")[0] || prev.firstName,
        lastName: session.user.name?.split(" ")[1] || prev.lastName,
        email: session.user.email || prev.email,
      }));
    }
  }, [isAuthenticated, session]);

  // Predefined amounts for one-time donations
  const oneTimeAmounts = [1, 5, 10, 25, 50, 100];

  // Predefined amounts for recurring donations
  const recurringAmounts = [5, 10, 25, 50, 100, 250];

  const currentAmounts =
    donationType === "one-time" ? oneTimeAmounts : recurringAmounts;
  const minAmount = donationType === "one-time" ? 1 : 5;
  const maxAmount = donationType === "recurring" ? 250 : undefined;

  // Fetch client token when payment step is reached
  useEffect(() => {
    const fetchClientToken = async () => {
      if (currentStep === "payment" && !clientToken) {
        setLoading(true);
        try {
          const response = await fetch("/api/donations/client-token");
          const data = await response.json();
          setClientToken(data.clientToken);
        } catch (error) {
          logger.error("Error fetching client token:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchClientToken();
  }, [currentStep, clientToken]);

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
    setIsCustomAmount(false);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setAmount(value);
    setIsCustomAmount(true);
  };

  const getSelectedAmount = () => {
    return isCustomAmount ? customAmount : amount;
  };

  const isValidAmount = () => {
    const numAmount = parseFloat(getSelectedAmount());
    if (isNaN(numAmount) || numAmount < minAmount) return false;
    if (maxAmount && numAmount > maxAmount) return false;
    return true;
  };

  const canProceedToPayment = () => {
    if (!isValidAmount()) return false;

    // If user is authenticated, fall back to session data when donorInfo fields are empty
    if (isAuthenticated) {
      const email =
        donorInfo.email.trim() || session?.user?.email?.trim() || "";
      return email !== ""; // We always have name in session, so only ensure email
    }

    // User NOT authenticated
    if (donorInfo.isAnonymous) {
      return donorInfo.email.trim() !== "";
    }

    return (
      donorInfo.firstName.trim() !== "" &&
      donorInfo.lastName.trim() !== "" &&
      donorInfo.email.trim() !== ""
    );
  };

  const handleContinueToPayment = () => {
    if (canProceedToPayment()) {
      setCurrentStep("payment");
    }
  };

  const handlePaymentSuccess = (result: any) => {
    setPaymentResult(result);
    setCurrentStep("success");
  };

  const handlePaymentError = (error: string) => {
    logger.error("Payment error:", error);
    setPaymentError(error);
  };

  const resetForm = () => {
    setCurrentStep("amount");
    setAmount("");
    setCustomAmount("");
    setIsCustomAmount(false);
    setPaymentMethod("card-paypal");
    setClientToken("");
    setPaymentResult(null);
    setDonorInfo({
      firstName: "",
      lastName: "",
      email: "",
      isAnonymous: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTabChange = (value: string) => {
    setClientToken("");
    setDonationType(value as DonationType);
    setAmount("");
    setCustomAmount("");
    setIsCustomAmount(false);
    setCurrentStep("amount");
  };

  const renderAmountStep = () => (
    <>
      <Tabs
        value={donationType}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="one-time"
            className="flex items-center gap-2 px-0"
          >
            <HeartPlus className="w-4 h-4" />
            One-Time Donation
          </TabsTrigger>
          <TabsTrigger
            value="recurring"
            className="flex items-center gap-2 px-0"
          >
            <Repeat className="w-4 h-4" />
            Monthly Giving
          </TabsTrigger>
        </TabsList>

        <TabsContent value="one-time" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#2F4858] mb-2">
              Micro-Donation (One-Time)
            </h3>
            <p className="text-sm text-[#2F4858]/70 mb-4">
              Support campaigns, operations, and our Peace Expression Fund.
              Minimum $1.
            </p>

            {/* Amount Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-[#2F4858]">
                Select Amount (USD)
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {currentAmounts.map((value) => (
                  <Button
                    key={value}
                    variant={
                      amount === value.toString() && !isCustomAmount
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleAmountSelect(value)}
                    className="h-12"
                  >
                    ${value}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="custom-amount"
                  className="text-sm font-medium text-[#2F4858]"
                >
                  Custom Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2F4858]/70">
                    $
                  </span>
                  <Input
                    id="custom-amount"
                    type="number"
                    min={minAmount}
                    placeholder={`${minAmount}.00`}
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {customAmount && parseFloat(customAmount) < minAmount && (
                  <p className="text-sm text-red-600">
                    Minimum donation is ${minAmount}
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#2F4858] mb-2">
              Monthly Giving Program
            </h3>
            <p className="text-sm text-[#2F4858]/70 mb-4">
              Join our Peace Sustainers with a monthly donation. $5-$250/month
              for sustained impact.
            </p>

            {/* Amount Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-[#2F4858]">
                Monthly Amount (USD)
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {currentAmounts.map((value) => (
                  <Button
                    key={value}
                    variant={
                      amount === value.toString() && !isCustomAmount
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleAmountSelect(value)}
                    className="h-12"
                  >
                    ${value}/mo
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="custom-recurring-amount"
                  className="text-sm font-medium text-[#2F4858]"
                >
                  Custom Monthly Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2F4858]/70">
                    $
                  </span>
                  <Input
                    id="custom-recurring-amount"
                    type="number"
                    min={minAmount}
                    max={maxAmount}
                    placeholder={`${minAmount}.00`}
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {customAmount && (
                  <>
                    {parseFloat(customAmount) < minAmount && (
                      <p className="text-sm text-red-600">
                        Minimum monthly donation is ${minAmount}
                      </p>
                    )}
                    {maxAmount && parseFloat(customAmount) > maxAmount && (
                      <p className="text-sm text-red-600">
                        Maximum monthly donation is ${maxAmount}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Donor Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-[#2F4858]">
          Donor Information
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-[#2F4858]"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              value={session?.user?.name?.split(" ")[0] || donorInfo.firstName}
              onChange={(e) =>
                setDonorInfo({ ...donorInfo, firstName: e.target.value })
              }
              disabled={donorInfo.isAnonymous}
              required={!donorInfo.isAnonymous}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-[#2F4858]"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              value={session?.user?.name?.split(" ")[1] || donorInfo.lastName}
              onChange={(e) =>
                setDonorInfo({ ...donorInfo, lastName: e.target.value })
              }
              disabled={donorInfo.isAnonymous}
              required={!donorInfo.isAnonymous}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#2F4858]">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={session?.user?.email || donorInfo.email}
            onChange={(e) =>
              setDonorInfo({ ...donorInfo, email: e.target.value })
            }
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={donorInfo.isAnonymous}
            onChange={(e) =>
              setDonorInfo({ ...donorInfo, isAnonymous: e.target.checked })
            }
            className="rounded border-gray-300"
          />
          <Label htmlFor="anonymous" className="text-sm text-[#2F4858]">
            Make this donation anonymous
          </Label>
        </div>
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleContinueToPayment}
        disabled={!canProceedToPayment()}
        className="w-full h-12 text-lg"
      >
        Continue to Payment - ${getSelectedAmount()}{" "}
        {donationType === "recurring" ? "/month" : ""}
      </Button>
    </>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#2F4858]">
            {donationType === "one-time"
              ? "Complete Your Donation"
              : "Set Up Monthly Giving"}
          </h3>
          <p className="text-sm text-[#2F4858]/70">
            Amount: ${getSelectedAmount()}{" "}
            {donationType === "recurring" ? "/month" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setCurrentStep("amount");
            setClientToken("");
          }}
          className="text-sm"
        >
          ← Back
        </Button>
      </div>

      {/* TODO: Add back in ACH payment method when is ready to be used */}

      {/* Payment Method Selection for One-Time Donations */}
      {/* {donationType === "one-time" && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-[#2F4858]">
            Choose Payment Method
          </Label>
          <div className="flex flex-row gap-3">
            <Button
              variant={paymentMethod === "card-paypal" ? "default" : "outline"}
              onClick={() => {
                setPaymentMethod("card-paypal");
                setClientToken("");
              }}
              className="h-16 flex flex-col items-center gap-1 w-full"
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs">Card / PayPal</span>
            </Button>
            <Button
              variant={paymentMethod === "ach" ? "default" : "outline"}
              onClick={() => {
                setPaymentMethod("ach");
                setClientToken("");
              }}
              className="h-16 flex flex-col items-center gap-1 w-full"
            >
              <Building2 className="w-5 h-5" />
              <span className="text-xs">ACH Transfer</span>
            </Button>
          </div>
        </div>
      )} */}

      {/* Payment Components */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-[#86AC9D] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-[#2F4858]">Loading payment form...</p>
        </div>
      ) : clientToken ? (
        <>
          {paymentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {paymentError}
                <br />
                Please double-check your bank details or try another test
                account number (e.g. <code>1000000000</code>) as per Braintree’s
                sandbox guide.
              </AlertDescription>
            </Alert>
          )}
          {paymentMethod === "ach" && donationType === "one-time" ? (
            <ACHPayment
              amount={getSelectedAmount()}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              clientToken={clientToken}
              donorInfo={{
                firstName: donorInfo.firstName,
                lastName: donorInfo.lastName,
              }}
            />
          ) : (
            <DropInPayment
              key={`${donationType}-${paymentMethod}-${currentStep}-${clientToken}-${amount}`}
              amount={getSelectedAmount()}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              clientToken={clientToken}
              isRecurring={donationType === "recurring"}
            />
          )}
        </>
      ) : (
        <div className="text-center py-8 text-red-600">
          <p>Failed to load payment form. Please try again.</p>
          <Button
            onClick={() => setCurrentStep("amount")}
            variant="outline"
            className="mt-2"
          >
            Go Back
          </Button>
        </div>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8 space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#2F4858] mb-2">
          Thank You for Your {donationType === "recurring" ? "Monthly " : ""}
          Donation!
        </h3>
        <p className="text-[#2F4858]/70">
          Your generous contribution helps us continue our mission for peace.
        </p>
      </div>

      {paymentResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-green-900 mb-2">Payment Details</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p>
              Transaction ID:{" "}
              {paymentResult.transaction?.id || paymentResult.subscription?.id}
            </p>
            <p>
              Amount: $
              {paymentResult.transaction?.amount ||
                paymentResult.subscription?.amount}
            </p>
            <p>
              Type:{" "}
              {donationType === "recurring"
                ? "Monthly Subscription"
                : "One-time Donation"}
            </p>
            {paymentResult.subscription?.nextBillingDate && (
              <p>
                Next billing:{" "}
                {new Date(
                  paymentResult.subscription.nextBillingDate
                ).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      <Button onClick={handleClose} className="w-full h-12">
        Close
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/*
        Bottom-sheet behaviour (mobile):
        – position fixed bottom-0 left-0 right-0
        – remove default centering transforms
        – full-width, rounded top corners, 85 vh max height

        From the small breakpoint (sm: ≥640 px) we restore the regular centered modal:
        – translate-50%, left 50%, top 50%
        – auto width with max-w-2xl and 90 vh max-height
      */}
      <DialogContent className="w-full h-[80vh] md:h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#2F4858] flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#86AC9D]" />
              Support Our Mission
            </DialogTitle>
          </div>
          <p className="text-sm text-[#2F4858]/70">
            Your donation helps us expand our impact for peace initiatives
            worldwide.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === "amount" && renderAmountStep()}
          {currentStep === "payment" && renderPaymentStep()}
          {currentStep === "success" && renderSuccessStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
