"use client";

import { useEffect, useRef, useState } from "react";

interface PayPalDonateSimpleProps {
  hostedButtonId: string;
  env?: "sandbox" | "production";
  className?: string;
  onComplete?: (params: any) => void;
  onError?: (error: any) => void;
}

export function PayPalDonateSimple({
  hostedButtonId,
  env = "production",
  className = "",
  onComplete,
  onError,
}: PayPalDonateSimpleProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRendered = useRef(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let mounted = true;

    const createButton = () => {
      if (!mounted || !containerRef.current || buttonRendered.current) return;

      try {
        // Limpiar el contenedor
        containerRef.current.innerHTML = "";

        // Crear el botón directamente con HTML
        const buttonId = `paypal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        containerRef.current.innerHTML = `
          <div id="${buttonId}"></div>
        `;

        // Función para renderizar el botón
        const renderPayPalButton = () => {
          if (!window.PayPal?.Donation?.Button) {
            timeoutId = setTimeout(renderPayPalButton, 100);
            return;
          }

          try {
            window.PayPal.Donation.Button({
              env: env,
              hosted_button_id: hostedButtonId,
              image: {
                src: "https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif",
                alt: "Donate with PayPal button",
                title: "PayPal - The safer, easier way to pay online!",
              },
              onComplete: function (params: any) {
                console.log("Donation completed:", params);
                onComplete?.(params);
              },
              onError: function (error: any) {
                console.error("PayPal donation error:", error);
                if (mounted) {
                  setHasError(true);
                  setIsLoading(false);
                }
                onError?.(error);
              },
            }).render(`#${buttonId}`);

            if (mounted) {
              buttonRendered.current = true;
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error rendering PayPal button:", error);
            if (mounted) {
              setHasError(true);
              setIsLoading(false);
            }
            onError?.(error);
          }
        };

        renderPayPalButton();
      } catch (error) {
        console.error("Error creating PayPal button:", error);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
        onError?.(error);
      }
    };

    const loadScript = () => {
      // Si PayPal ya está disponible, crear el botón inmediatamente
      if (window.PayPal?.Donation?.Button) {
        createButton();
        return;
      }

      // Si el script ya existe, esperar a que se cargue
      const existingScript = document.querySelector(
        'script[src*="paypalobjects.com/donate/sdk/donate-sdk.js"]'
      );

      if (existingScript) {
        const checkPayPal = () => {
          if (window.PayPal?.Donation?.Button) {
            createButton();
          } else {
            timeoutId = setTimeout(checkPayPal, 100);
          }
        };
        checkPayPal();
        return;
      }

      // Crear y cargar el script
      const script = document.createElement("script");
      script.src = "https://www.paypalobjects.com/donate/sdk/donate-sdk.js";
      script.charset = "UTF-8";
      script.async = true;

      script.onload = () => {
        const waitForPayPal = () => {
          if (window.PayPal?.Donation?.Button) {
            createButton();
          } else {
            timeoutId = setTimeout(waitForPayPal, 100);
          }
        };
        waitForPayPal();
      };

      script.onerror = () => {
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
        onError?.(new Error("Failed to load PayPal SDK"));
      };

      document.head.appendChild(script);
    };

    // Pequeño delay para asegurar que el DOM esté listo
    timeoutId = setTimeout(loadScript, 100);

    return () => {
      mounted = false;
      buttonRendered.current = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [hostedButtonId, env, onComplete, onError]);

  if (hasError) {
    return (
      <div className={`paypal-donate-container ${className}`}>
        <div className="bg-red-100 border border-red-300 h-12 w-32 rounded flex items-center justify-center">
          <span className="text-xs text-red-600">Error loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`paypal-donate-container ${className}`}>
      <div
        ref={containerRef}
        className="paypal-donate-button"
        style={{ minHeight: "48px", minWidth: "128px" }}
      >
        {isLoading && (
          <div className="animate-pulse bg-gray-200 h-12 w-32 rounded flex items-center justify-center">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Tipos globales
declare global {
  interface Window {
    PayPal?: {
      Donation: {
        Button: (config: any) => {
          render: (selector: string) => void;
        };
      };
    };
  }
}
