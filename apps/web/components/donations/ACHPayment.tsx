"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as braintree from "braintree-web";

interface ACHPaymentProps {
  amount: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  clientToken: string;
  donorInfo?: {
    firstName: string;
    lastName: string;
  };
}

interface BankAccountInfo {
  routingNumber: string;
  accountNumber: string;
  accountType: "checking" | "savings";
  ownershipType: "personal" | "business";
  billingAddress: {
    streetAddress: string;
    locality: string;
    region: string;
    postalCode: string;
  };
}

export default function ACHPayment({
  amount,
  onSuccess,
  onError,
  clientToken,
  donorInfo,
}: ACHPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [usBankAccount, setUsBankAccount] =
    useState<braintree.USBankAccount | null>(null);
  const hasInitializedRef = useRef(false);
  const [bankInfo, setBankInfo] = useState<BankAccountInfo>({
    routingNumber: "",
    accountNumber: "",
    accountType: "checking",
    ownershipType: "personal",
    billingAddress: {
      streetAddress: "",
      locality: "",
      region: "",
      postalCode: "",
    },
  });

  useEffect(() => {
    if (!clientToken || hasInitializedRef.current) return;

    const initializeBraintree = async () => {
      try {
        const clientInstance = await braintree.client.create({
          authorization: clientToken,
        });

        console.log("clientInstance", clientInstance);

        const usBankAccountInstance = await braintree.usBankAccount.create({
          client: clientInstance,
        });

        setUsBankAccount(usBankAccountInstance);
        hasInitializedRef.current = true;
      } catch (error) {
        console.error("Error initializing Braintree:", error);
        onError("Failed to initialize payment system");
      }
    };

    initializeBraintree();

    return () => {
      // Reset on unmount so modal re-open works
      hasInitializedRef.current = false;
      setUsBankAccount(null);
    };
  }, [clientToken, onError]);

  // Removed dynamic script loading – using npm package instead

  const mapBraintreeError = (e: any): string => {
    if (e?.code) {
      switch (e.code) {
        case "US_BANK_ACCOUNT_OPTION_REQUIRED":
          return "Your bank details are incomplete. Please fill all required fields.";
        case "US_BANK_ACCOUNT_TOKENIZATION_NETWORK_ERROR":
          return "Network error while verifying the bank account. Please try again.";
        default:
          return e.message || "Unexpected Braintree error";
      }
    }
    return e?.message || "Payment processing failed";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usBankAccount) {
      onError("Payment system not ready");
      return;
    }

    setLoading(true);

    try {
      // Tokenize the bank account
      const { nonce } = (await (usBankAccount as any).tokenize({
        bankDetails: {
          routingNumber: bankInfo.routingNumber,
          accountNumber: bankInfo.accountNumber,
          accountType: bankInfo.accountType.toUpperCase(),
          ownershipType: bankInfo.ownershipType,
          firstName: donorInfo?.firstName?.trim() || "Anonymous",
          lastName: donorInfo?.lastName?.trim() || "Donor",
          billingAddress: {
            streetAddress: bankInfo.billingAddress.streetAddress,
            locality: bankInfo.billingAddress.locality,
            region: bankInfo.billingAddress.region,
            postalCode: bankInfo.billingAddress.postalCode,
          },
        },
        mandateText:
          'By clicking "Donate Now", I authorize Pledge4Peace to electronically debit my account.',
      })) as any;

      // Process the donation
      const response = await fetch("/api/donations/one-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nonce,
          amount,
          paymentMethod: "ach",
          donorInfo,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result);
      } else {
        onError(result.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("ACH payment error:", error);
      onError(mapBraintreeError(error));
    } finally {
      setLoading(false);
    }
  };

  const updateBankInfo = (
    field: keyof BankAccountInfo | string,
    value: any
  ) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setBankInfo((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setBankInfo((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Building2 className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="font-semibold text-blue-900">ACH Bank Transfer</h3>
          <p className="text-sm text-blue-700">
            Direct transfer from your US bank account. Settlement takes 3-5
            business days.
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ACH payments are only available for US bank accounts. Your account
          will be verified before processing.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bank Account Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-[#2F4858]">
            Bank Account Information
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="routing-number">Routing Number</Label>
              <Input
                id="routing-number"
                value={bankInfo.routingNumber}
                onChange={(e) =>
                  updateBankInfo("routingNumber", e.target.value)
                }
                placeholder="123456789"
                maxLength={9}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                value={bankInfo.accountNumber}
                onChange={(e) =>
                  updateBankInfo("accountNumber", e.target.value)
                }
                placeholder="Account number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select
                value={bankInfo.accountType}
                onValueChange={(value: "checking" | "savings") =>
                  updateBankInfo("accountType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account Ownership</Label>
              <Select
                value={bankInfo.ownershipType}
                onValueChange={(value: "personal" | "business") =>
                  updateBankInfo("ownershipType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h4 className="font-semibold text-[#2F4858]">Billing Address</h4>

          <div className="space-y-2">
            <Label htmlFor="street-address">Street Address</Label>
            <Input
              id="street-address"
              value={bankInfo.billingAddress.streetAddress}
              onChange={(e) =>
                updateBankInfo("billingAddress.streetAddress", e.target.value)
              }
              placeholder="123 Main Street"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={bankInfo.billingAddress.locality}
                onChange={(e) =>
                  updateBankInfo("billingAddress.locality", e.target.value)
                }
                placeholder="New York"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={bankInfo.billingAddress.region}
                onChange={(e) =>
                  updateBankInfo("billingAddress.region", e.target.value)
                }
                placeholder="NY"
                maxLength={2}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              value={bankInfo.billingAddress.postalCode}
              onChange={(e) =>
                updateBankInfo("billingAddress.postalCode", e.target.value)
              }
              placeholder="10001"
              maxLength={10}
              required
            />
          </div>
        </div>

        {/* Mandate Text */}
        <div className="p-4 bg-gray-50 border rounded-lg">
          <p className="text-sm text-gray-700">
            By clicking "Donate ${amount}", I authorize Pledge4Peace to
            electronically debit my account for the amount specified. This
            authorization will remain in effect until I notify Pledge4Peace that
            I wish to revoke this authorization.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || !usBankAccount}
          className="w-full h-12 text-lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Donate ${amount} via ACH
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
