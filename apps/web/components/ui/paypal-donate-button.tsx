"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

export function PayPalDonateButton({
  hostedButtonId,
  env = "production",
  className = "",
  onComplete,
  onError,
}: PayPalDonateButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const componentIdRef = useRef(
    `paypal-donate-${Math.random().toString(36).substr(2, 9)}`
  );
  const [isButtonRendered, setIsButtonRendered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadPayPalScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Si ya está cargado globalmente, resolver inmediatamente
        if (window.PayPal?.Donation?.Button) {
          scriptLoadedRef.current = true;
          resolve();
          return;
        }

        // Si ya existe el script, verificar si ya se cargó
        const existingScript = document.querySelector(
          'script[src*="paypalobjects.com/donate/sdk/donate-sdk.js"]'
        );

        if (existingScript) {
          // Si el script existe pero PayPal no está disponible, esperar
          if (!window.PayPal) {
            const checkPayPal = () => {
              if (window.PayPal?.Donation?.Button) {
                scriptLoadedRef.current = true;
                resolve();
              } else {
                setTimeout(checkPayPal, 50); // Revisar cada 50ms
              }
            };
            checkPayPal();
          } else {
            scriptLoadedRef.current = true;
            resolve();
          }
          return;
        }

        // Crear y cargar el script
        const script = document.createElement("script");
        script.src = "https://www.paypalobjects.com/donate/sdk/donate-sdk.js";
        script.charset = "UTF-8";
        script.async = true;

        script.onload = () => {
          // Esperar un poco para que PayPal se inicialice completamente
          const waitForPayPal = () => {
            if (window.PayPal?.Donation?.Button) {
              scriptLoadedRef.current = true;
              resolve();
            } else {
              setTimeout(waitForPayPal, 50);
            }
          };
          waitForPayPal();
        };

        script.onerror = () => {
          console.error("Error loading PayPal Donate SDK");
          setIsLoading(false);
          setHasError(true);
          reject(new Error("Failed to load PayPal SDK"));
        };

        document.head.appendChild(script);
      });
    };

    const initializeButton = () => {
      if (!containerRef.current || isButtonRendered) return;

      try {
        if (window.PayPal?.Donation?.Button) {
          const containerId = componentIdRef.current;

          // Verificar si ya existe un elemento con este ID
          const existingElement = document.getElementById(containerId);
          if (existingElement && existingElement !== containerRef.current) {
            console.warn("PayPal button with this ID already exists, skipping");
            return;
          }

          // Limpiar cualquier contenido previo del contenedor
          if (containerRef.current) {
            containerRef.current.innerHTML = "";
            containerRef.current.id = containerId;
          }

          const button = window.PayPal.Donation.Button({
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
              onError?.(error);
            },
          });

          // Renderizar el botón
          button.render(`#${containerId}`);
          setIsButtonRendered(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing PayPal button:", error);
        setIsLoading(false);
        setHasError(true);
        onError?.(error);
      }
    };

    const setupPayPalButton = async () => {
      try {
        await loadPayPalScript();
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
          initializeButton();
          // Si después de 5 segundos aún no se ha renderizado, mostrar error
          setTimeout(() => {
            if (!isButtonRendered) {
              console.warn("PayPal button took too long to render");
              setIsLoading(false);
            }
          }, 5000);
        }, 100);
      } catch (error) {
        console.error("Failed to setup PayPal button:", error);
        setIsLoading(false);
        setHasError(true);
        onError?.(error);
      }
    };

    setupPayPalButton();

    // Cleanup
    return () => {
      // Limpiar el contenedor del botón de forma segura
      if (containerRef.current) {
        try {
          // Usar un timeout para evitar conflictos con React
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.innerHTML = "";
            }
          }, 0);
        } catch (error) {
          console.warn("Error cleaning up PayPal button:", error);
        }
      }
      setIsButtonRendered(false);
      setIsLoading(true);
      setHasError(false);
    };
  }, [hostedButtonId, env, onComplete, onError]);

  return (
    <div className={`paypal-donate-container ${className}`}>
      <div ref={containerRef} className="paypal-donate-button">
        {/* Placeholder mientras se carga */}
        {isLoading && !hasError && (
          <div className="animate-pulse bg-gray-200 h-12 w-32 rounded flex items-center justify-center">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        )}

        {/* Mensaje de error */}
        {hasError && (
          <div className="bg-red-100 border border-red-300 h-12 w-32 rounded flex items-center justify-center">
            <span className="text-xs text-red-600">Error</span>
          </div>
        )}
      </div>
    </div>
  );
}
