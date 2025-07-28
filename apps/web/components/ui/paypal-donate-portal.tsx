"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PayPalDonatePortalProps {
  hostedButtonId: string;
  env?: "sandbox" | "production";
  className?: string;
  onComplete?: (params: any) => void;
  onError?: (error: any) => void;
}

export function PayPalDonatePortal({
  hostedButtonId,
  env = "production",
  className = "",
  onComplete,
  onError,
}: PayPalDonatePortalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const placeholderRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Crear un contenedor portal fuera del árbol de React
    const container = document.createElement("div");
    container.style.cssText = `
      position: absolute;
      z-index: 9999;
      pointer-events: auto;
    `;
    document.body.appendChild(container);
    setPortalContainer(container);
    portalRef.current = container;

    return () => {
      // Limpiar el portal al desmontar
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  useEffect(() => {
    if (!portalContainer || !placeholderRef.current) return;

    let mounted = true;

    const positionPortal = () => {
      if (!placeholderRef.current || !portalContainer) return;

      const rect = placeholderRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      portalContainer.style.top = `${rect.top + scrollTop}px`;
      portalContainer.style.left = `${rect.left + scrollLeft}px`;
      portalContainer.style.width = `${rect.width}px`;
      portalContainer.style.height = `${rect.height}px`;
    };

    const loadAndRenderButton = async () => {
      try {
        // Cargar script si no existe
        if (!window.PayPal?.Donation?.Button) {
          const existingScript = document.querySelector(
            'script[src*="paypalobjects.com/donate/sdk/donate-sdk.js"]'
          );

          if (!existingScript) {
            const script = document.createElement("script");
            script.src =
              "https://www.paypalobjects.com/donate/sdk/donate-sdk.js";
            script.charset = "UTF-8";
            script.async = true;
            document.head.appendChild(script);

            await new Promise<void>((resolve, reject) => {
              script.onload = () => resolve();
              script.onerror = () =>
                reject(new Error("Failed to load PayPal SDK"));
            });
          }

          // Esperar a que PayPal esté disponible
          while (!window.PayPal?.Donation?.Button && mounted) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        if (!mounted) return;

        // Crear botón en el portal
        const buttonId = `paypal-portal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        portalContainer.innerHTML = `<div id="${buttonId}"></div>`;

        window
          .PayPal!.Donation.Button({
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
          })
          .render(`#${buttonId}`);

        if (mounted) {
          setIsLoading(false);
          positionPortal();
        }
      } catch (error) {
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
        onError?.(error);
      }
    };

    // Posicionar el portal cuando cambie el tamaño o scroll
    const handleReposition = () => positionPortal();
    window.addEventListener("scroll", handleReposition);
    window.addEventListener("resize", handleReposition);

    loadAndRenderButton();

    return () => {
      mounted = false;
      window.removeEventListener("scroll", handleReposition);
      window.removeEventListener("resize", handleReposition);
    };
  }, [portalContainer, hostedButtonId, env, onComplete, onError]);

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
        ref={placeholderRef}
        className="paypal-donate-placeholder"
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
