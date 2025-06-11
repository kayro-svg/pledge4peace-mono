"use client";

import { useState, useEffect } from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Cookie,
  Shield,
  BarChart3,
  Target,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { CookieCategory } from "@/lib/cookies/consent-manager";

interface CookieBannerProps {
  position?: "bottom" | "top" | "center";
  showLogo?: boolean;
}

export function CookieBanner({
  position = "bottom",
  showLogo = true,
}: CookieBannerProps) {
  const {
    needsConsent,
    updateConsent,
    acceptAll,
    rejectAll,
    cookiesByCategory,
  } = useCookieConsent();

  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Siempre true
    analytics: false,
    marketing: false,
    functional: true, // Por defecto true para mejor UX
  });

  // Mostrar banner solo si necesita consentimiento
  useEffect(() => {
    // Pequeño delay para evitar flash
    const timer = setTimeout(() => {
      setIsVisible(needsConsent);
    }, 100);

    return () => clearTimeout(timer);
  }, [needsConsent]);

  // Manejar cambio de preferencias
  const handlePreferenceChange = (category: CookieCategory, value: boolean) => {
    if (category === "necessary") return; // No se puede cambiar

    setPreferences((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  // Guardar preferencias personalizadas
  const handleSavePreferences = () => {
    updateConsent(preferences);
    setIsVisible(false);
  };

  // Aceptar todo y cerrar
  const handleAcceptAll = () => {
    acceptAll();
    setIsVisible(false);
  };

  // Rechazar todo y cerrar
  const handleRejectAll = () => {
    rejectAll();
    setIsVisible(false);
  };

  // Cerrar sin guardar (solo ocultar)
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Iconos para categorías
  const categoryIcons = {
    necessary: Shield,
    analytics: BarChart3,
    marketing: Target,
    functional: Settings,
  };

  // Descripciones para categorías
  const categoryDescriptions = {
    necessary:
      "Essential for the basic functioning of the website. Cannot be disabled.",
    analytics: "Help us understand how you interact with our website.",
    marketing: "Used to show relevant ads and measure their effectiveness.",
    functional: "Improve the functionality and customization of the website.",
  };

  // Clases de posición
  const positionClasses = {
    bottom: "fixed bottom-0 left-0 right-0",
    top: "fixed top-0 left-0 right-0",
    center: "fixed inset-0 flex items-center justify-center",
  };

  return (
    <div className={`z-[100] ${position === "center" ? "bg-black/50" : ""}`}>
      <div className={`${positionClasses[position]} z-50`}>
        <Card
          className={`
          ${position === "center" ? "w-full max-w-2xl mx-4" : "w-full"} 
          ${position !== "center" ? "rounded-none border-x-0" : ""}
          shadow-xl border-2
        `}
        >
          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {showLogo && <Cookie className="w-6 h-6 text-brand-500" />}
                <h3 className="text-lg font-semibold text-gray-900">
                  Cookie Settings
                </h3>
              </div>
              {position === "center" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Descripción principal */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                We use cookies to improve your experience, analyze website
                traffic, and for marketing purposes. You can manage your
                preferences at any time.
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-gray-500">
                  By continuing to browse, you agree to our
                </span>
                <a
                  href="/terms-and-conditions"
                  className="text-brand-500 hover:underline inline-flex items-center gap-1"
                >
                  Terms and Conditions
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-gray-500">y</span>
                <a
                  href="/cookie-policy"
                  className="text-brand-500 hover:underline inline-flex items-center gap-1"
                >
                  Cookie Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Detalles expandibles */}
            {showDetails && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-gray-900">
                  Manage your preferences
                </h4>

                {Object.entries(cookiesByCategory).map(
                  ([category, cookies]) => {
                    const Icon = categoryIcons[category as CookieCategory];
                    const isNecessary = category === "necessary";

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm capitalize">
                                  {category === "necessary"
                                    ? "Necessary"
                                    : category === "analytics"
                                      ? "Analytics"
                                      : category === "marketing"
                                        ? "Marketing"
                                        : "Functional"}
                                </h5>
                                {isNecessary && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {
                                  categoryDescriptions[
                                    category as CookieCategory
                                  ]
                                }
                              </p>
                              <div className="text-xs text-gray-400 mt-1">
                                {cookies.length} cookie
                                {cookies.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={preferences[category as CookieCategory]}
                            onCheckedChange={(value) =>
                              handlePreferenceChange(
                                category as CookieCategory,
                                value
                              )
                            }
                            disabled={isNecessary}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                onClick={handleAcceptAll}
                variant="outline"
                className="flex-1"
              >
                Accept All
              </Button>

              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1"
              >
                Reject Optional
              </Button>

              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="ghost"
                className="flex-1 flex items-center gap-2"
              >
                {showDetails ? (
                  <>
                    Hide
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Customize
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>

              {showDetails && (
                <Button
                  onClick={handleSavePreferences}
                  variant="secondary"
                  className="flex-1"
                >
                  Save Preferences
                </Button>
              )}
            </div>

            {/* Footer legal */}
            <div className="text-xs text-gray-400 pt-2 border-t">
              <p>
                This site complies with GDPR, CCPA and other privacy
                regulations. Your data is protected and you can exercise your
                rights at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
