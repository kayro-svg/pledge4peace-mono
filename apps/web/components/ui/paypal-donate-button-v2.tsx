"use client";

import { useEffect, useRef, useState } from "react";

interface PayPalDonateButtonV2Props {
  hostedButtonId: string;
  env?: "sandbox" | "production";
  className?: string;
  onComplete?: (params: any) => void;
  onError?: (error: any) => void;
}

export function PayPalDonateButtonV2({
  hostedButtonId,
  env = "production",
  className = "",
  onComplete,
  onError,
}: PayPalDonateButtonV2Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [buttonHtml, setButtonHtml] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadPayPalScript = async () => {
      try {
        // Verificar si PayPal ya está disponible
        if (window.PayPal?.Donation?.Button) {
          if (mounted) {
            renderButton();
          }
          return;
        }

        // Verificar si el script ya existe
        const existingScript = document.querySelector(
          'script[src*="paypalobjects.com/donate/sdk/donate-sdk.js"]'
        );

        if (existingScript) {
          // Esperar a que se cargue
          const checkPayPal = () => {
            if (window.PayPal?.Donation?.Button) {
              if (mounted) {
                renderButton();
              }
            } else {
              setTimeout(checkPayPal, 100);
            }
          };
          checkPayPal();
          return;
        }

        // Crear nuevo script
        const script = document.createElement("script");
        script.src = "https://www.paypalobjects.com/donate/sdk/donate-sdk.js";
        script.charset = "UTF-8";
        script.async = true;

        script.onload = () => {
          const waitForPayPal = () => {
            if (window.PayPal?.Donation?.Button) {
              if (mounted) {
                renderButton();
              }
            } else {
              setTimeout(waitForPayPal, 100);
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
      } catch (error) {
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
        onError?.(error);
      }
    };

    const renderButton = () => {
      if (!mounted) return;

      try {
        // Crear un ID único para este botón
        const buttonId = `paypal-btn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        // Crear el HTML del botón
        const html = `
          <div id="${buttonId}" style="min-height: 48px; min-width: 128px;"></div>
          <script>
            (function() {
              if (window.PayPal && window.PayPal.Donation && window.PayPal.Donation.Button) {
                try {
                  window.PayPal.Donation.Button({
                    env: '${env}',
                    hosted_button_id: '${hostedButtonId}',
                    image: {
                      src: 'https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif',
                      alt: 'Donate with PayPal button',
                      title: 'PayPal - The safer, easier way to pay online!'
                    },
                    onComplete: function(params) {
                      console.log('Donation completed:', params);
                      if (window.paypalDonateCallback) {
                        window.paypalDonateCallback(params);
                      }
                    },
                    onError: function(error) {
                      console.error('PayPal donation error:', error);
                      if (window.paypalDonateErrorCallback) {
                        window.paypalDonateErrorCallback(error);
                      }
                    }
                  }).render('#${buttonId}');
                } catch (error) {
                  console.error('Error rendering PayPal button:', error);
                  if (window.paypalDonateErrorCallback) {
                    window.paypalDonateErrorCallback(error);
                  }
                }
              }
            })();
          </script>
        `;

        setButtonHtml(html);
        setIsLoading(false);
      } catch (error) {
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
        onError?.(error);
      }
    };

    // Configurar callbacks globales
    (window as any).paypalDonateCallback = onComplete;
    (window as any).paypalDonateErrorCallback = onError;

    loadPayPalScript();

    return () => {
      mounted = false;
      // Limpiar callbacks globales
      delete (window as any).paypalDonateCallback;
      delete (window as any).paypalDonateErrorCallback;
    };
  }, [hostedButtonId, env, onComplete, onError]);

  if (isLoading) {
    return (
      <div className={`paypal-donate-container ${className}`}>
        <div className="animate-pulse bg-gray-200 h-12 w-32 rounded flex items-center justify-center">
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

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
    <div
      className={`paypal-donate-container ${className}`}
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: buttonHtml }}
    />
  );
}

// Declarar tipos globales para TypeScript
declare global {
  interface Window {
    PayPal?: {
      Donation: {
        Button: (config: any) => {
          render: (selector: string) => void;
        };
      };
    };
    paypalDonateCallback?: (params: any) => void;
    paypalDonateErrorCallback?: (error: any) => void;
  }
}
