import { useCallback } from "react";

interface DonationParams {
  tx: string; // Transaction ID
  st: string; // Transaction status
  amt: string; // Transaction amount
  cc: string; // Currency code
  cm?: string; // Custom message
  item_number?: string; // Purpose configured for the transaction
  item_name?: string; // Program selected by the donor
}

interface UsePayPalDonateProps {
  onSuccess?: (params: DonationParams) => void;
  onError?: (error: any) => void;
  trackingEnabled?: boolean;
}

export function usePayPalDonate({
  onSuccess,
  onError,
  trackingEnabled = true,
}: UsePayPalDonateProps = {}) {
  const handleDonationComplete = useCallback(
    (params: DonationParams) => {
      if (trackingEnabled) {
        // Log para debugging
        console.log("PayPal Donation Analytics:", {
          transactionId: params.tx,
          amount: params.amt,
          currency: params.cc,
          status: params.st,
          timestamp: new Date().toISOString(),
        });

        // Si tienes Google Analytics configurado
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "donation", {
            event_category: "ecommerce",
            event_label: "paypal_donation",
            value: parseFloat(params.amt) || 0,
            currency: params.cc || "USD",
            transaction_id: params.tx,
          });
        }

        // Si tienes Facebook Pixel configurado
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq("track", "Donate", {
            value: parseFloat(params.amt) || 0,
            currency: params.cc || "USD",
          });
        }
      }

      // Callback personalizado
      onSuccess?.(params);
    },
    [onSuccess, trackingEnabled]
  );

  const handleDonationError = useCallback(
    (error: any) => {
      console.error("PayPal Donation Error:", error);

      // Tracking de errores
      if (
        trackingEnabled &&
        typeof window !== "undefined" &&
        (window as any).gtag
      ) {
        (window as any).gtag("event", "exception", {
          description: `PayPal donation error: ${error.message || "Unknown error"}`,
          fatal: false,
        });
      }

      onError?.(error);
    },
    [onError, trackingEnabled]
  );

  return {
    handleDonationComplete,
    handleDonationError,
  };
}
