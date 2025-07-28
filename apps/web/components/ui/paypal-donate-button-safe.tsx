"use client";

import { useEffect, useRef, useState } from "react";

interface PayPalDonateButtonProps {
  hostedButtonId: string;
  env?: "sandbox" | "production";
  className?: string;
  onComplete?: (params: any) => void;
  onError?: (error: any) => void;
}

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

export function PayPalDonateButtonSafe({
  hostedButtonId,
  env = "production",
  className = "",
  onComplete,
  onError,
}: PayPalDonateButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const mountedRef = useRef(true);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Cargar script de PayPal
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const loadScript = async () => {
      try {
        // Verificar si PayPal ya está disponible
        if (window.PayPal?.Donation?.Button) {
          if (mountedRef.current) {
            setIsScriptLoaded(true);
          }
          return;
        }

        // Verificar si el script ya existe
        const existingScript = document.querySelector(
          'script[src*="paypalobjects.com/donate/sdk/donate-sdk.js"]'
        );

        if (existingScript) {
          // Esperar a que se cargue
          const waitForPayPal = () => {
            if (window.PayPal?.Donation?.Button) {
              if (mountedRef.current) {
                setIsScriptLoaded(true);
              }
            } else {
              timeoutId = setTimeout(waitForPayPal, 100);
            }
          };
          waitForPayPal();
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
              if (mountedRef.current) {
                setIsScriptLoaded(true);
              }
            } else {
              timeoutId = setTimeout(waitForPayPal, 100);
            }
          };
          waitForPayPal();
        };

        script.onerror = () => {
          if (mountedRef.current) {
            setHasError(true);
            setIsLoading(false);
          }
          onError?.(new Error("Failed to load PayPal SDK"));
        };

        document.head.appendChild(script);
      } catch (error) {
        if (mountedRef.current) {
          setHasError(true);
          setIsLoading(false);
        }
        onError?.(error);
      }
    };

    loadScript();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [onError]);

  // Renderizar botón cuando el script esté listo
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !mountedRef.current) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const renderButton = () => {
      try {
        if (!containerRef.current || !mountedRef.current) return;

        // Crear un contenedor interno para aislar del DOM de React
        const innerContainer = document.createElement("div");
        innerContainer.id = `paypal-inner-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        // Limpiar contenedor y agregar el interno
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(innerContainer);

        const button = window.PayPal!.Donation.Button({
          env: env,
          hosted_button_id: hostedButtonId,
          image: {
            src: "https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif",
            alt: "Donate with PayPal button",
            title: "PayPal - The safer, easier way to pay online!",
          },
          onComplete: (params: any) => {
            console.log("Donation completed:", params);
            onComplete?.(params);
          },
          onError: (error: any) => {
            console.error("PayPal donation error:", error);
            if (mountedRef.current) {
              setHasError(true);
              setIsLoading(false);
            }
            onError?.(error);
          },
        });

        button.render(`#${innerContainer.id}`);

        if (mountedRef.current) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error rendering PayPal button:", error);
        if (mountedRef.current) {
          setHasError(true);
          setIsLoading(false);
        }
        onError?.(error);
      }
    };

    // Pequeño delay para asegurar que el DOM esté listo
    timeoutId = setTimeout(renderButton, 100);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isScriptLoaded, hostedButtonId, env, onComplete, onError]);

  return (
    <div className={`paypal-donate-container ${className}`}>
      <div
        ref={containerRef}
        className="paypal-donate-button"
        style={{ minHeight: "48px", minWidth: "128px" }}
      >
        {/* Placeholder mientras se carga */}
        {isLoading && !hasError && (
          <div className="animate-pulse bg-gray-200 h-12 w-32 rounded flex items-center justify-center">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        )}

        {/* Mensaje de error */}
        {hasError && (
          <div className="bg-red-100 border border-red-300 h-12 w-32 rounded flex items-center justify-center">
            <span className="text-xs text-red-600">Error loading</span>
          </div>
        )}
      </div>
    </div>
  );
}
