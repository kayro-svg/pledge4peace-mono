"use client";

import { useState } from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { Button } from "@/components/ui/button";
import { Cookie, Settings } from "lucide-react";
import Link from "next/link";

interface CookieSettingsLinkProps {
  variant?: "link" | "button" | "icon";
  className?: string;
  showIcon?: boolean;
}

export function CookieSettingsLink({
  variant = "link",
  className = "",
  showIcon = true,
}: CookieSettingsLinkProps) {
  const { hasConsent } = useCookieConsent();

  // Si no hay consentimiento aún, no mostrar el enlace (el banner se encarga)
  if (!hasConsent) return null;

  if (variant === "icon") {
    return (
      <Link href="/cookie-preferences">
        <Button
          variant="ghost"
          size="sm"
          className={`p-2 ${className}`}
          title="Configurar cookies"
        >
          <Cookie className="w-4 h-4" />
        </Button>
      </Link>
    );
  }

  if (variant === "button") {
    return (
      <Link href="/cookie-preferences">
        <Button variant="outline" size="sm" className={`${className}`}>
          {showIcon && <Settings className="w-4 h-4 mr-2" />}
          Configurar Cookies
        </Button>
      </Link>
    );
  }

  // variant === 'link'
  return (
    <Link
      href="/cookie-preferences"
      className={`text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 ${className}`}
    >
      {showIcon && <Cookie className="w-3 h-3" />}
      Configurar cookies
    </Link>
  );
}
