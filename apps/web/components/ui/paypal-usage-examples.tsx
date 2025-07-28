"use client";

import { PayPalDonateSimple } from "./paypal-donate-simple";
import { useToast } from "@/hooks/use-toast";

/**
 * Ejemplo 1: Botón simple en cualquier página
 */
export function PayPalButtonExample1() {
  const { toast } = useToast();

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Apoya nuestro proyecto</h3>
      <PayPalDonateSimple
        hostedButtonId="FLZCUFCT6RYUW"
        env="production"
        onComplete={(params) => {
          toast({
            title: "¡Gracias por tu donación!",
            description: `Donación de ${params.amt} ${params.cc} completada exitosamente.`,
            duration: 5000,
          });
        }}
        onError={(error) => {
          toast({
            title: "Error en la donación",
            description: "Hubo un problema. Por favor, inténtalo de nuevo.",
            variant: "destructive",
          });
        }}
      />
    </div>
  );
}

/**
 * Ejemplo 2: Botón flotante en esquina
 */
export function PayPalFloatingButton() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <PayPalDonateSimple
        hostedButtonId="FLZCUFCT6RYUW"
        env="production"
        className="shadow-lg"
      />
    </div>
  );
}

/**
 * Ejemplo 3: Botón en modal o popup
 */
export function PayPalModalButton() {
  const { toast } = useToast();

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        ¿Te gusta nuestro proyecto?
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Tu donación nos ayuda a seguir desarrollando herramientas para la paz
        mundial.
      </p>

      <div className="flex justify-center">
        <PayPalDonateSimple
          hostedButtonId="FLZCUFCT6RYUW"
          env="production"
          onComplete={(params) => {
            toast({
              title: "¡Increíble!",
              description: `Tu donación de ${params.amt} ${params.cc} ha sido recibida. ¡Muchas gracias!`,
              duration: 8000,
            });
          }}
        />
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Procesado de forma segura por PayPal
      </p>
    </div>
  );
}

/**
 * Ejemplo 4: Botón en sidebar
 */
export function PayPalSidebarButton() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg border">
      <div className="text-center mb-3">
        <h4 className="font-semibold text-gray-800">Apóyanos</h4>
        <p className="text-sm text-gray-600">Cada donación cuenta</p>
      </div>

      <div className="flex justify-center">
        <PayPalDonateSimple
          hostedButtonId="FLZCUFCT6RYUW"
          env="production"
          className="transform hover:scale-105 transition-transform"
        />
      </div>
    </div>
  );
}

/**
 * Ejemplo 5: Botón con información adicional
 */
export function PayPalInfoButton() {
  const { toast } = useToast();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="text-xl font-bold mb-3">Haz la diferencia</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ Promovemos la paz mundial</li>
            <li>✅ Conectamos comunidades</li>
            <li>✅ Facilitamos el diálogo</li>
            <li>✅ Construimos puentes de entendimiento</li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Tu donación nos permite continuar esta importante misión
          </p>

          <PayPalDonateSimple
            hostedButtonId="FLZCUFCT6RYUW"
            env="production"
            onComplete={(params) => {
              // Tracking personalizado
              if (typeof window !== "undefined" && (window as any).gtag) {
                (window as any).gtag("event", "donation_completed", {
                  event_category: "donation",
                  event_label: "paypal",
                  value: parseFloat(params.amt) || 0,
                  currency: params.cc || "USD",
                });
              }

              toast({
                title: "¡Eres increíble!",
                description: `Gracias por tu donación de ${params.amt} ${params.cc}. Juntos construimos un mundo mejor.`,
                duration: 10000,
              });
            }}
            onError={(error) => {
              console.error("Donation error:", error);
              toast({
                title: "Oops, algo salió mal",
                description:
                  "No pudimos procesar tu donación. Por favor, inténtalo de nuevo en unos minutos.",
                variant: "destructive",
              });
            }}
          />

          <p className="text-xs text-gray-500 mt-2">Seguro y confiable</p>
        </div>
      </div>
    </div>
  );
}
