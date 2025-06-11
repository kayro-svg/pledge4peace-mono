/**
 * Sistema de gestión de consentimiento de cookies
 * Cumple con GDPR, CCPA y otras regulaciones de privacidad
 */

import { logger } from "../utils/logger";

export type CookieCategory =
  | "necessary"
  | "analytics"
  | "marketing"
  | "functional";

export interface CookieConsent {
  necessary: boolean; // Siempre true, no se puede desactivar (session, auth, etc.)
  analytics: boolean; // Google Analytics, métricas, etc. (futuro)
  marketing: boolean; // Facebook Pixel, Google Ads, etc. (futuro)
  functional: boolean; // Chatbots, mapas, videos embebidos, preferencias UI
  timestamp: number; // Cuándo se dio el consentimiento
  version: string; // Para manejar cambios en políticas
  ipAddress?: string; // Para cumplimiento legal (opcional)
}

export interface CookieInfo {
  name: string;
  category: CookieCategory;
  description: string;
  duration: string;
  provider: string;
}

export class ConsentManager {
  private static readonly CONSENT_KEY = "cookie-consent-pledge4peace";
  private static readonly CONSENT_VERSION = "1.0";
  private static readonly CONSENT_EXPIRY_DAYS = 365; // 1 año según GDPR

  // Lista de cookies que utilizamos actualmente
  static readonly CURRENT_COOKIES: CookieInfo[] = [
    // Cookies necesarias (NextAuth)
    {
      name: "next-auth.session-token",
      category: "necessary",
      description: "Session token for user authentication",
      duration: "30 days",
      provider: "NextAuth.js",
    },
    {
      name: "next-auth.csrf-token",
      category: "necessary",
      description: "CSRF protection token for security",
      duration: "Session",
      provider: "NextAuth.js",
    },
    {
      name: "next-auth.callback-url",
      category: "necessary",
      description: "Redirect URL after login",
      duration: "Session",
      provider: "NextAuth.js",
    },
    // Cookies funcionales
    {
      name: "sidebar-state",
      category: "functional",
      description: "Remember the open/closed state of the sidebar",
      duration: "1 year",
      provider: "Pledge4Peace",
    },
    {
      name: "theme-preference",
      category: "functional",
      description: "User's light/dark theme preference",
      duration: "1 year",
      provider: "Pledge4Peace",
    },
  ];

  /**
   * Guardar consentimiento del usuario
   */
  static saveConsent(
    consent: Partial<CookieConsent>,
    ipAddress?: string
  ): void {
    // Verificar que estamos en el navegador, no en SSR
    if (typeof window === "undefined") return;

    const fullConsent: CookieConsent = {
      necessary: true, // Siempre necesarias para el funcionamiento
      analytics: consent.analytics ?? false,
      marketing: consent.marketing ?? false,
      functional: consent.functional ?? true, // Por defecto true para UX
      timestamp: Date.now(),
      version: this.CONSENT_VERSION,
      ipAddress: ipAddress,
    };

    try {
      // Guardar en localStorage
      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(fullConsent));

      // Guardar en cookie para acceso desde servidor (opcional)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.CONSENT_EXPIRY_DAYS);

      document.cookie = `${this.CONSENT_KEY}=${JSON.stringify(fullConsent)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

      // Aplicar inmediatamente
      this.applyConsent(fullConsent);

      logger.log("[ConsentManager] Consent saved:", fullConsent);
    } catch (error) {
      logger.error("[ConsentManager] Error saving consent:", error);
    }
  }

  /**
   * Obtener consentimiento actual
   */
  static getConsent(): CookieConsent | null {
    // Verificar que estamos en el navegador, no en SSR
    if (typeof window === "undefined") return null;

    try {
      // Intentar desde localStorage primero
      let stored = localStorage.getItem(this.CONSENT_KEY);

      // Si no está en localStorage, intentar desde cookie
      if (!stored) {
        const cookieMatch = document.cookie.match(
          new RegExp(`${this.CONSENT_KEY}=([^;]+)`)
        );
        stored = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      }

      if (!stored) return null;

      const consent = JSON.parse(stored) as CookieConsent;

      // Verificar si la versión es actual
      if (consent.version !== this.CONSENT_VERSION) {
        logger.log(
          "[ConsentManager] Consent version outdated, requires update"
        );
        this.clearConsent();
        return null;
      }

      // Verificar si no ha expirado (1 año)
      const daysSinceConsent =
        (Date.now() - consent.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceConsent > this.CONSENT_EXPIRY_DAYS) {
        logger.log("[ConsentManager] Consent expired, requires renewal");
        this.clearConsent();
        return null;
      }

      return consent;
    } catch (error) {
      logger.error("[ConsentManager] Error reading consent:", error);
      return null;
    }
  }

  /**
   * Verificar si necesita mostrar banner de consentimiento
   */
  static needsConsent(): boolean {
    return this.getConsent() === null;
  }

  /**
   * Limpiar consentimiento almacenado
   */
  static clearConsent(): void {
    // Verificar que estamos en el navegador, no en SSR
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.CONSENT_KEY);
      document.cookie = `${this.CONSENT_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      logger.log("[ConsentManager] Consent cleared");
    } catch (error) {
      logger.error("[ConsentManager] Error clearing consent:", error);
    }
  }

  /**
   * Aplicar consentimiento (cargar/descargar funcionalidades)
   */
  private static applyConsent(consent: CookieConsent): void {
    // Verificar que estamos en el navegador, no en SSR
    if (typeof window === "undefined") return;

    try {
      // Por ahora solo manejamos cookies funcionales
      if (!consent.functional) {
        // Limpiar cookies funcionales si el usuario no consintió
        this.deleteCookie("sidebar-state");
        this.deleteCookie("theme-preference");
      }

      // Futuro: Aquí se agregarían GA y FB Pixel
      if (consent.analytics) {
        // this.loadGoogleAnalytics();
        logger.log(
          "[ConsentManager] Analytics consented (not implemented yet)"
        );
      }

      if (consent.marketing) {
        // this.loadMarketingScripts();
        logger.log(
          "[ConsentManager] Marketing consented (not implemented yet)"
        );
      }

      // Disparar evento personalizado para que otros componentes reaccionen
      window.dispatchEvent(
        new CustomEvent("consentChanged", {
          detail: consent,
        })
      );

      logger.log("[ConsentManager] Consent applied:", consent);
    } catch (error) {
      logger.error("[ConsentManager] Error applying consent:", error);
    }
  }

  /**
   * Obtener información sobre todas las cookies por categoría
   */
  static getCookiesByCategory(): Record<CookieCategory, CookieInfo[]> {
    return this.CURRENT_COOKIES.reduce(
      (acc, cookie) => {
        if (!acc[cookie.category]) {
          acc[cookie.category] = [];
        }
        acc[cookie.category].push(cookie);
        return acc;
      },
      {} as Record<CookieCategory, CookieInfo[]>
    );
  }

  /**
   * Verificar si una categoría específica tiene consentimiento
   */
  static hasConsentForCategory(category: CookieCategory): boolean {
    const consent = this.getConsent();
    if (!consent) return false;

    return consent[category] === true;
  }

  /**
   * Utility para eliminar cookies específicas
   */
  private static deleteCookie(name: string): void {
    if (typeof document === "undefined") return;

    // Eliminar en diferentes combinaciones de path y domain
    const domains = [
      window.location.hostname,
      `.${window.location.hostname}`,
      "",
    ];

    const paths = ["/", ""];

    for (const domain of domains) {
      for (const path of paths) {
        const cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};${domain ? ` domain=${domain};` : ""}`;
        document.cookie = cookieString;
      }
    }
  }

  /**
   * Obtener lista de cookies actualmente almacenadas en el navegador
   */
  static getStoredCookies(): { name: string; value: string }[] {
    if (typeof document === "undefined") return [];

    return document.cookie
      .split(";")
      .map((cookie) => {
        const [name, ...valueParts] = cookie.trim().split("=");
        return {
          name: name.trim(),
          value: valueParts.join("=").trim(),
        };
      })
      .filter((cookie) => cookie.name && cookie.value);
  }

  /**
   * Inicializar el sistema de consentimiento
   */
  static initialize(): void {
    if (typeof window === "undefined") return;

    try {
      const existingConsent = this.getConsent();
      if (existingConsent) {
        // Aplicar consentimiento existente
        this.applyConsent(existingConsent);
        logger.log("[ConsentManager] System initialized with existing consent");
      } else {
        logger.log(
          "[ConsentManager] Sistema inicializado, requiere consentimiento"
        );
      }
    } catch (error) {
      logger.error("[ConsentManager] Error initializing system:", error);
    }
  }
}
