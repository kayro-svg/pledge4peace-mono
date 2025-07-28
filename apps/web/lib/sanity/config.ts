/**
 * CONFIGURACIÓN CENTRALIZADA DE SANITY PARA PRODUCCIÓN
 *
 * Esta configuración está optimizada para:
 * - Minimizar costos de API
 * - Maximizar uso del CDN
 * - Optimizar rendimiento
 * - Facilitar debugging
 */

import { logger } from "../utils/logger";

export const SANITY_CONFIG = {
  // ===== CONFIGURACIÓN BASE =====
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f5zk7i1f",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",

  // ===== CONFIGURACIÓN DE CACHE =====
  cache: {
    // Tiempos de cache por tipo de contenido
    homePage: 3600, // 1 hora - cambia poco
    campaigns: 1800, // 30 minutos - puede cambiar frecuentemente
    articles: 7200, // 2 horas - contenido estático
    conferences: 1800, // 30 minutos - fechas importantes
    aboutPage: 86400, // 24 horas - cambia muy poco
    volunteerPage: 7200, // 2 horas - contenido semi-estático

    // Cache por defecto para contenido no especificado
    default: 3600, // 1 hora
  },

  // ===== CONFIGURACIÓN DE CDN =====
  cdn: {
    // Usar CDN en producción para reducir costos
    enabled: process.env.NODE_ENV === "production",

    // Forzar CDN incluso en desarrollo (opcional para testing)
    forceInDevelopment: process.env.FORCE_SANITY_CDN === "true",
  },

  // ===== CONFIGURACIÓN DE WEBHOOKS =====
  webhooks: {
    secret: process.env.SANITY_REVALIDATE_SECRET,

    // URL base para producción (actualizar con tu dominio real)
    baseUrl:
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_SITE_URL || "https://tu-dominio.com"
        : "https://5a08b44a2da0.ngrok-free.app/",
  },

  // ===== CONFIGURACIÓN DE LOGS =====
  logging: {
    enabled:
      process.env.NODE_ENV === "development" ||
      process.env.SANITY_DEBUG === "true",
    level: process.env.SANITY_LOG_LEVEL || "info", // info, warn, error
  },

  // ===== CONFIGURACIÓN DE MONITOREO =====
  monitoring: {
    // Alertas para uso excesivo de API
    maxApiCallsPerMinute: 60,
    alertOnHighUsage: process.env.NODE_ENV === "production",
  },
};

/**
 * Determina si se debe usar CDN o API directa
 */
export function shouldUseCdn(): boolean {
  return SANITY_CONFIG.cdn.enabled || SANITY_CONFIG.cdn.forceInDevelopment;
}

/**
 * Obtiene el tiempo de cache para un tipo de contenido
 */
export function getCacheTime(contentType: string): number {
  return (
    SANITY_CONFIG.cache[contentType as keyof typeof SANITY_CONFIG.cache] ||
    SANITY_CONFIG.cache.default
  );
}

/**
 * URL completa del webhook para el entorno actual
 */
export function getWebhookUrl(): string {
  return `${SANITY_CONFIG.webhooks.baseUrl}/api/revalidate?secret=${SANITY_CONFIG.webhooks.secret}`;
}

/**
 * Logger condicional para desarrollo
 */
export function log(message: string, data?: any) {
  if (SANITY_CONFIG.logging.enabled) {
    logger.log(`[Sanity] ${message}`, data ? data : "");
  }
}
