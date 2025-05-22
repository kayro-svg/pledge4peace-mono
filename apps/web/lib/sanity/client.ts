// lib/sanity/client.ts
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03", // Fecha en formato YYYY-MM-DD
  useCdn: process.env.NODE_ENV === "production", // Usar CDN en producción
  perspective: "published",
});
