// lib/sanity/client.ts
import { createClient } from "next-sanity";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

// ===== CLIENTE PRINCIPAL (CONFIGURACIÓN INTELIGENTE POR ENTORNO) =====
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f5zk7i1f",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",

  // 🚀 CONFIGURACIÓN INTELIGENTE POR ENTORNO
  // En desarrollo: Sin CDN para cambios inmediatos
  // En producción: Con CDN para reducir costos
  useCdn: isProduction, // Solo CDN en producción

  perspective: "published", // Solo contenido publicado

  // 📊 CONFIGURACIÓN AVANZADA DE CACHE
  // ❌ REMOVIDO: requestTagPrefix - causaba corrupción de datos
  // requestTagPrefix: "sanity-",

  // ⚡ VISUAL EDITING (solo desarrollo)
  stega: {
    enabled: isDevelopment,
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "/studio",
  },
});

// ===== CLIENTE PARA OPERACIONES ADMINISTRATIVAS =====
// Siempre directo a la API, sin CDN
export const adminClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f5zk7i1f",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  useCdn: false, // Siempre API directa para operaciones admin
  perspective: "published",
  token: process.env.SANITY_API_TOKEN,
});

// ===== CLIENTE PARA DEVELOPMENT (sin cache, datos frescos) =====
export const devClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f5zk7i1f",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  useCdn: false, // Sin CDN para datos inmediatos
  perspective: "published",
  // Sin token para queries públicas
});

// ===== CLIENTE PARA DRAFTS (solo si necesitas preview) =====
export const previewClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f5zk7i1f",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  useCdn: false, // Los drafts no están en CDN
  perspective: "previewDrafts",
  token: process.env.SANITY_API_TOKEN,
});

// ===== FUNCIÓN HELPER PARA OBTENER EL CLIENTE APROPIADO =====
export function getClient(options?: {
  forceFresh?: boolean;
  admin?: boolean;
  preview?: boolean;
}) {
  if (options?.preview) return previewClient;
  if (options?.admin) return adminClient;
  if (options?.forceFresh || isDevelopment) return devClient;
  return client;
}
