"use client";

import { PayPalDonateSimple } from "./paypal-donate-simple";
import { usePayPalDonate } from "@/hooks/usePayPalDonate";
import { useToast } from "@/hooks/use-toast";

interface DonateButtonWrapperProps {
  hostedButtonId: string;
  env?: "sandbox" | "production";
  className?: string;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "custom";
}

export function DonateButtonWrapper({
  hostedButtonId,
  env = "production",
  className = "",
  position = "top-right",
}: DonateButtonWrapperProps) {
  const { toast } = useToast();

  const { handleDonationComplete, handleDonationError } = usePayPalDonate({
    onSuccess: (params) => {
      toast({
        title: "¡Gracias por tu donación!",
        description: `Tu donación de ${params.amt} ${params.cc} ha sido procesada exitosamente.`,
        duration: 5000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error en la donación",
        description:
          "Hubo un problema procesando tu donación. Por favor, inténtalo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "fixed top-4 left-4 z-50";
      case "top-right":
        return "fixed top-4 right-4 z-50";
      case "bottom-left":
        return "fixed bottom-4 left-4 z-50";
      case "bottom-right":
        return "fixed bottom-4 right-4 z-50";
      case "custom":
        return className;
      default:
        return "fixed top-4 right-4 z-50";
    }
  };

  return (
    <div className={position === "custom" ? className : getPositionClasses()}>
      <PayPalDonateSimple
        hostedButtonId={hostedButtonId}
        env={env}
        onComplete={handleDonationComplete}
        onError={handleDonationError}
      />
    </div>
  );
}
