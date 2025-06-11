import { createClient } from "next-sanity";
import { logger } from "../utils/logger";

// Cliente para operaciones administrativas
const adminClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f5zk7i1f",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  token: process.env.SANITY_API_TOKEN, // Necesitas un token con permisos de admin
  useCdn: false,
});

export interface WebhookConfig {
  name: string;
  url: string;
  dataset: string;
  types: string[];
  includeDrafts: boolean;
  httpMethod: "GET" | "POST";
  apiVersion: string;
}

/**
 * Crea un webhook en Sanity programáticamente
 */
export async function createWebhook(config: WebhookConfig) {
  try {
    const webhook = await adminClient.request({
      url: `/hooks`,
      method: "POST",
      body: {
        name: config.name,
        url: config.url,
        dataset: config.dataset,
        trigger: {
          types: config.types,
          includeDrafts: config.includeDrafts,
        },
        httpMethod: config.httpMethod,
        apiVersion: config.apiVersion,
      },
    });

    logger.log("✅ Webhook creado exitosamente:", webhook);
    return webhook;
  } catch (error) {
    logger.error("❌ Error creando webhook:", error);
    throw error;
  }
}

/**
 * Lista todos los webhooks existentes
 */
export async function listWebhooks() {
  try {
    const webhooks = await adminClient.request({
      url: `/hooks`,
      method: "GET",
    });

    logger.log("📋 Webhooks existentes:");
    webhooks.forEach((webhook: any, index: number) => {
      logger.log(`${index + 1}. ${webhook.name} - ${webhook.url}`);
    });

    return webhooks;
  } catch (error) {
    logger.error("❌ Error listando webhooks:", error);
    throw error;
  }
}

/**
 * Elimina un webhook por ID
 */
export async function deleteWebhook(webhookId: string) {
  try {
    await adminClient.request({
      url: `/hooks/${webhookId}`,
      method: "DELETE",
    });

    logger.log("🗑️ Webhook eliminado exitosamente");
  } catch (error) {
    logger.error("❌ Error eliminando webhook:", error);
    throw error;
  }
}

/**
 * Configuración predeterminada para el webhook de revalidación
 */
export const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  name: "Next.js Revalidation",
  url: "https://2c2d-190-32-165-59.ngrok-free.app/api/revalidate?secret=YOUR_SECRET", // Reemplazar con tu secret
  dataset: "production",
  types: [
    "homePage",
    "campaign",
    "article",
    "conference",
    "aboutPage",
    "volunteerPage",
  ],
  includeDrafts: false,
  httpMethod: "POST",
  apiVersion: "2023-05-03",
};

/**
 * Script principal para configurar webhooks
 */
export async function setupRevalidationWebhook() {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    throw new Error(
      "SANITY_REVALIDATE_SECRET no está configurado en las variables de entorno"
    );
  }

  // Actualizar la URL con el secret real
  const config: WebhookConfig = {
    ...DEFAULT_WEBHOOK_CONFIG,
    url: `https://2c2d-190-32-165-59.ngrok-free.app/api/revalidate?secret=${secret}`,
  };

  logger.log("🚀 Configurando webhook de revalidación...");
  logger.log("📡 URL:", config.url);
  logger.log("📋 Tipos de documento:", config.types.join(", "));

  // Listar webhooks existentes
  await listWebhooks();

  // Crear el nuevo webhook
  await createWebhook(config);

  logger.log("✅ ¡Webhook de revalidación configurado exitosamente!");
  logger.log(
    "💡 Ahora los cambios en Sanity se reflejarán automáticamente en tu sitio web"
  );
}

// Función de utilidad para testing
export async function testWebhook(url: string, payload: any) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    logger.log("🧪 Resultado del test:", result);
    return result;
  } catch (error) {
    logger.error("❌ Error en test de webhook:", error);
    throw error;
  }
}
