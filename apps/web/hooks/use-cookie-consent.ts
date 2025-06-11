"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ConsentManager,
  CookieConsent,
  CookieCategory,
} from "@/lib/cookies/consent-manager";
import { logger } from "@/lib/utils/logger";

export interface UseCookieConsentReturn {
  consent: CookieConsent | null;
  loading: boolean;
  hasConsent: boolean;
  needsConsent: boolean;
  canUseAnalytics: boolean;
  canUseMarketing: boolean;
  canUseFunctional: boolean;
  updateConsent: (consent: Partial<CookieConsent>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  clearConsent: () => void;
  hasConsentForCategory: (category: CookieCategory) => boolean;
  cookiesByCategory: ReturnType<typeof ConsentManager.getCookiesByCategory>;
}

/**
 * Hook para gestionar el consentimiento de cookies
 * Proporciona estado reactivo y métodos para manejar el consentimiento
 */
export function useCookieConsent(): UseCookieConsentReturn {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Marcar como montado para evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar consentimiento inicial
  useEffect(() => {
    if (!mounted) return; // Esperar a que el componente esté montado

    try {
      const currentConsent = ConsentManager.getConsent();
      setConsent(currentConsent);
      setLoading(false);

      // Inicializar el sistema si es la primera vez
      ConsentManager.initialize();
    } catch (error) {
      logger.error("[useCookieConsent] Error loading consent:", error);
      setLoading(false);
    }
  }, [mounted]);

  // Escuchar cambios en el consentimiento
  useEffect(() => {
    if (!mounted) return; // Solo agregar listeners después del mount

    const handleConsentChange = (event: CustomEvent<CookieConsent>) => {
      setConsent(event.detail);
    };

    window.addEventListener(
      "consentChanged",
      handleConsentChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "consentChanged",
        handleConsentChange as EventListener
      );
    };
  }, [mounted]);

  // Actualizar consentimiento
  const updateConsent = useCallback(
    (newConsent: Partial<CookieConsent>) => {
      if (!mounted) return; // Solo permitir actualizaciones después del mount

      try {
        ConsentManager.saveConsent(newConsent);
        // El estado se actualizará automáticamente via el event listener
      } catch (error) {
        logger.error("[useCookieConsent] Error updating consent:", error);
      }
    },
    [mounted]
  );

  // Aceptar todas las cookies
  const acceptAll = useCallback(() => {
    updateConsent({
      analytics: true,
      marketing: true,
      functional: true,
    });
  }, [updateConsent]);

  // Rechazar todas las cookies opcionales
  const rejectAll = useCallback(() => {
    updateConsent({
      analytics: false,
      marketing: false,
      functional: false,
    });
  }, [updateConsent]);

  // Limpiar consentimiento (para testing o reset)
  const clearConsent = useCallback(() => {
    if (!mounted) return;

    try {
      ConsentManager.clearConsent();
      setConsent(null);
    } catch (error) {
      logger.error("[useCookieConsent] Error clearing consent:", error);
    }
  }, [mounted]);

  // Verificar consentimiento para categoría específica
  const hasConsentForCategory = useCallback(
    (category: CookieCategory): boolean => {
      if (!mounted) return false; // Durante SSR, no hay consentimiento
      return ConsentManager.hasConsentForCategory(category);
    },
    [mounted]
  );

  // Obtener cookies por categoría
  const cookiesByCategory = ConsentManager.getCookiesByCategory();

  return {
    consent,
    loading: loading || !mounted, // Mantener loading hasta estar montado
    hasConsent: mounted && consent !== null,
    needsConsent: mounted ? ConsentManager.needsConsent() : false,
    canUseAnalytics: consent?.analytics ?? false,
    canUseMarketing: consent?.marketing ?? false,
    canUseFunctional: consent?.functional ?? false,
    updateConsent,
    acceptAll,
    rejectAll,
    clearConsent,
    hasConsentForCategory,
    cookiesByCategory,
  };
}
