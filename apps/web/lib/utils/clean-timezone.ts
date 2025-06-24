import { logger } from "./logger";

/**
 * 🧹 FUNCIÓN UTILITARIA PARA LIMPIAR TIMEZONES CORRUPTOS
 *
 * Sanity está enviando dato
 * s de timezone con caracteres Unicode invisibles.
 * Esta función limpia todos los caracteres corruptos y valida el resultado.
 */

// Lista de timezones válidos que manejamos
const VALID_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Asia/Kolkata",
  "Asia/Dubai",
  "America/Sao_Paulo",
] as const;

export type ValidTimezone = (typeof VALID_TIMEZONES)[number];

/**
 * Limpia un timezone corrupto eliminando caracteres Unicode invisibles
 * @param timezone - El timezone potencialmente corrupto
 * @returns Timezone limpio y válido
 */
export function cleanTimezone(timezone?: string | null): ValidTimezone {
  if (!timezone || typeof timezone !== "string") {
    logger.warn(
      "🚨 cleanTimezone: Invalid input, using UTC fallback:",
      timezone
    );
    return "UTC";
  }

  // Limpiar caracteres invisibles usando expresión regular robusta
  const cleaned = timezone
    .replace(/[\u200B-\u200D\uFEFF\u2060\u180E\u00AD]/g, "") // Espacios de ancho cero y caracteres de control
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Caracteres de control ASCII y extendidos
    .replace(/[\u2000-\u206F]/g, "") // Espacios y puntuación Unicode
    .replace(/[\uE000-\uF8FF]/g, "") // Área de uso privado
    .replace(/[\uFFF0-\uFFFF]/g, "") // Caracteres especiales
    .trim();

  const wasCorrupted = timezone.length !== cleaned.length;

  if (wasCorrupted) {
    logger.log("🧹 Timezone limpiado:", {
      original: timezone,
      originalLength: timezone.length,
      cleaned,
      cleanedLength: cleaned.length,
      charactersRemoved: timezone.length - cleaned.length,
    });
  }

  // Verificar si el timezone limpio es válido
  if (VALID_TIMEZONES.includes(cleaned as ValidTimezone)) {
    return cleaned as ValidTimezone;
  }

  // Logging detallado para debugging
  if (wasCorrupted || !VALID_TIMEZONES.includes(cleaned as ValidTimezone)) {
    logger.warn("⚠️ cleanTimezone: Timezone inválido después de limpiar:", {
      original: timezone,
      cleaned,
      validOptions: VALID_TIMEZONES,
      usingFallback: "America/New_York",
    });
  }

  // Fallback a America/New_York si no es válido
  return "America/New_York";
}

/**
 * Función auxiliar para debuggear timezones corruptos
 * @param timezone - El timezone a debuggear
 */
// export function debugTimezone(timezone: string, context = "Unknown") {
//   logger.log(`🐛 [${context}] Timezone debug:`, {
//     value: timezone,
//     length: timezone.length,
//     charCodes: Array.from(timezone).map((char) => char.charCodeAt(0)),
//     hasInvisibleChars:
//       /[\u200B-\u200D\uFEFF\u2060\u180E\u00AD\u0000-\u001F\u007F-\u009F\u2000-\u206F\uE000-\uF8FF\uFFF0-\uFFFF]/.test(
//         timezone
//       ),
//     invisibleCharCount:
//       timezone.length -
//       timezone.replace(
//         /[\u200B-\u200D\uFEFF\u2060\u180E\u00AD\u0000-\u001F\u007F-\u009F\u2000-\u206F\uE000-\uF8FF\uFFF0-\uFFFF]/g,
//         ""
//       ).length,
//   });
// }

/**
 * Hook para limpiar automáticamente objetos de evento
 * @param event - Objeto de evento con timezone potencialmente corrupto
 * @returns Evento con timezone limpio
 */
export function cleanEventTimezone<T extends { timezone?: string | null }>(
  event: T
): T & { timezone: ValidTimezone } {
  return {
    ...event,
    timezone: cleanTimezone(event.timezone),
  };
}
