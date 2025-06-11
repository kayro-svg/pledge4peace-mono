"use client";

import { useState } from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Cookie,
  Shield,
  BarChart3,
  Target,
  Settings,
  Info,
  Trash2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { CookieCategory, ConsentManager } from "@/lib/cookies/consent-manager";

export function CookiePreferencesCenter() {
  const {
    consent,
    updateConsent,
    acceptAll,
    rejectAll,
    clearConsent,
    cookiesByCategory,
  } = useCookieConsent();

  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
    functional: consent?.functional ?? false,
  });

  const [showStoredCookies, setShowStoredCookies] = useState(false);
  const [storedCookies, setStoredCookies] = useState<
    { name: string; value: string }[]
  >([]);

  // Manejar cambio de preferencias
  const handlePreferenceChange = (category: CookieCategory, value: boolean) => {
    if (category === "necessary") return;

    setPreferences((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  // Guardar preferencias
  const handleSavePreferences = () => {
    updateConsent(preferences);
  };

  // Mostrar cookies almacenadas
  const handleShowStoredCookies = () => {
    const cookies = ConsentManager.getStoredCookies();
    setStoredCookies(cookies);
    setShowStoredCookies(true);
  };

  // Iconos y datos para categorías
  const categoryData = {
    necessary: {
      icon: Shield,
      title: "Necessary Cookies",
      description:
        "These cookies are essential for the basic functioning of the website and cannot be disabled.",
      color: "text-green-600",
    },
    analytics: {
      icon: BarChart3,
      title: "Analytics Cookies",
      description:
        "Help us understand how visitors interact with our website by collecting anonymous information.",
      color: "text-blue-600",
    },
    marketing: {
      icon: Target,
      title: "Marketing Cookies",
      description:
        "Used to track visitors on websites with the intention of showing relevant and attractive ads.",
      color: "text-purple-600",
    },
    functional: {
      icon: Settings,
      title: "Functional Cookies",
      description:
        "Allow the website to provide improved functionality and customization.",
      color: "text-orange-600",
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Cookie className="w-8 h-8 text-brand-500" />
            <div>
              <CardTitle className="text-2xl">
                Cookie Preferences Center
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Manage how we use cookies and your personal data
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            Current State
          </CardTitle>
        </CardHeader>
        <CardContent>
          {consent ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Consent granted:</span>
                <Badge variant="outline">
                  {new Date(consent.timestamp).toLocaleDateString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Policy version:</span>
                <Badge variant="secondary">{consent.version}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {Object.entries(categoryData).map(([category, data]) => (
                  <div key={category} className="text-center">
                    <data.icon
                      className={`w-6 h-6 mx-auto mb-2 ${data.color}`}
                    />
                    <div className="text-sm font-medium">
                      {data.title.split(" ")[1]}
                    </div>
                    <Badge
                      variant={
                        consent[category as CookieCategory]
                          ? "default"
                          : "secondary"
                      }
                      className="mt-1"
                    >
                      {consent[category as CookieCategory]
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">You have not provided consent yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestión de categorías */}
      <div className="space-y-4">
        {Object.entries(categoryData).map(([category, data]) => {
          const cookies = cookiesByCategory[category as CookieCategory] || [];
          const isNecessary = category === "necessary";
          const Icon = data.icon;

          return (
            <Card key={category}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`w-6 h-6 mt-1 ${data.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{data.title}</h3>
                        {isNecessary && (
                          <Badge variant="secondary">Required</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {data.description}
                      </p>
                      <div className="text-sm text-gray-500">
                        <strong>{cookies.length}</strong> cookie
                        {cookies.length !== 1 ? "s" : ""} in this category
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[category as CookieCategory]}
                    onCheckedChange={(value) =>
                      handlePreferenceChange(category as CookieCategory, value)
                    }
                    disabled={isNecessary}
                  />
                </div>

                {/* Lista de cookies en esta categoría */}
                {cookies.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t">
                    <h4 className="font-medium text-sm">Used cookies:</h4>
                    {cookies.map((cookie, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">
                            {cookie.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {cookie.duration}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {cookie.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Provider: {cookie.provider}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Acciones principales */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSavePreferences} className="flex-1">
              Save Preferences
            </Button>

            <Button onClick={acceptAll} variant="outline" className="flex-1">
              Accept All
            </Button>

            <Button onClick={rejectAll} variant="outline" className="flex-1">
              Reject Optional
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Acciones avanzadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleShowStoredCookies}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              View Stored Cookies
            </Button>

            <Button
              onClick={clearConsent}
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Consent
            </Button>

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
          </div>

          {/* Mostrar cookies almacenadas */}
          {showStoredCookies && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Currently Stored Cookies</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowStoredCookies(false)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {storedCookies.map((cookie, index) => (
                  <div
                    key={index}
                    className="text-xs bg-white p-2 rounded border"
                  >
                    <div className="font-medium">{cookie.name}</div>
                    <div className="text-gray-500 truncate">{cookie.value}</div>
                  </div>
                ))}
                {storedCookies.length === 0 && (
                  <p className="text-sm text-gray-500">No cookies found</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enlaces legales */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              For more information on how we handle your data, please see:
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <a
                href="/privacy-policy"
                className="text-brand-500 hover:underline inline-flex items-center gap-1"
              >
                Terms and Conditions
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/cookie-policy"
                className="text-brand-500 hover:underline inline-flex items-center gap-1"
              >
                Cookie Policy
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
