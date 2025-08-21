import { logger } from "@/lib/utils/logger";
import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

const WEBHOOK_SECRET = process.env.SANITY_REVALIDATE_SECRET;
const isDevelopment = process.env.NODE_ENV === "development";

// Mapeo de tipos de documentos a tags de revalidación (SIN prefijo problemático)
const DOCUMENT_TYPE_TO_TAGS: Record<string, string[]> = {
  homePage: ["homepage"],
  campaign: ["campaign", "homepage"],
  article: ["article", "homepage"],
  conference: ["conference", "homepage"],
  aboutPage: ["aboutPage"],
  volunteerPage: ["volunteerPage"],
};

// Mapeo de tipos de documentos a paths críticos
const DOCUMENT_TYPE_TO_PATHS: Record<string, string[]> = {
  homePage: ["/"],
  campaign: ["/", "/campaigns"],
  article: ["/", "/articles"],
  conference: ["/", "/events"],
  aboutPage: ["/about"],
  volunteerPage: ["/volunteer"],
};

// 🔄 MODO DESARROLLO: Revalidación más agresiva
const DEV_EXTRA_PATHS = [
  "/",
  "/events",
  "/campaigns",
  "/articles",
  "/about",
  "/volunteer",
];

export async function POST(request: NextRequest) {
  logger.log("🔄 [Revalidate] Webhook recibido");

  try {
    // 1. Verificar secret
    const secret = request.nextUrl.searchParams.get("secret");
    if (secret !== WEBHOOK_SECRET) {
      logger.error("❌ [Revalidate] Secret inválido");
      return Response.json({ message: "Invalid secret" }, { status: 401 });
    }

    // 2. Parsear body del webhook
    let payload;
    try {
      const body = await request.text();
      logger.log(
        "📦 [Revalidate] Body crudo recibido:",
        body.substring(0, 200)
      );
      payload = JSON.parse(body);
    } catch (parseError) {
      logger.error("❌ [Revalidate] Error parsing JSON:", parseError);
      return Response.json(
        { message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    logger.log("🔍 [Revalidate] Payload procesado:", payload);

    // 3. Extraer información del webhook
    const documentType = payload._type;
    const documentId = payload._id;
    const slug = payload.slug?.current;

    logger.log(
      `📄 [Revalidate] Documento: type=${documentType}, id=${documentId}, slug=${slug}`
    );

    if (!documentType) {
      logger.warn("⚠️ [Revalidate] No se encontró _type en el payload");
      return Response.json(
        { message: "No document type found" },
        { status: 400 }
      );
    }

    const revalidated = {
      tags: [] as string[],
      paths: [] as string[],
      environment: isDevelopment ? "development" : "production",
    };

    // 4. Revalidar tags basados en el tipo de documento
    const tagsToRevalidate = DOCUMENT_TYPE_TO_TAGS[documentType] || [];
    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag);
        revalidated.tags.push(tag);
        logger.log(`✅ [Revalidate] Tag revalidado: ${tag}`);
      } catch (error) {
        logger.error(`❌ [Revalidate] Error revalidando tag ${tag}:`, error);
      }
    }

    // 5. Revalidar tag específico del documento si tiene slug
    if (slug && ["campaign", "article", "conference"].includes(documentType)) {
      const specificTag = `${documentType}-${slug}`;
      try {
        revalidateTag(specificTag);
        revalidated.tags.push(specificTag);
        logger.log(`✅ [Revalidate] Tag específico revalidado: ${specificTag}`);
      } catch (error) {
        logger.error(
          `❌ [Revalidate] Error revalidando tag específico ${specificTag}:`,
          error
        );
      }
    }

    // 6. Revalidar paths críticos
    const pathsToRevalidate = DOCUMENT_TYPE_TO_PATHS[documentType] || [];
    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
        revalidated.paths.push(path);
        logger.log(`✅ [Revalidate] Path revalidado: ${path}`);
      } catch (error) {
        logger.error(`❌ [Revalidate] Error revalidando path ${path}:`, error);
      }
    }

    // 7. Revalidar path específico del documento
    if (slug && ["campaign", "article", "conference"].includes(documentType)) {
      const specificPath =
        documentType === "conference"
          ? `/events/${slug}`
          : `/${documentType}s/${slug}`;
      try {
        revalidatePath(specificPath);
        revalidated.paths.push(specificPath);
        logger.log(
          `✅ [Revalidate] Path específico revalidado: ${specificPath}`
        );
      } catch (error) {
        logger.error(
          `❌ [Revalidate] Error revalidando path específico ${specificPath}:`,
          error
        );
      }
    }

    // 8. Notificaciones: Nueva campaña publicada → notificar (MVP: moderadores)
    if (documentType === "campaign" && slug) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
          const res = await fetch(`${apiUrl}/notifications`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NOTIFICATIONS_BOT_TOKEN || ""}`,
            },
            body: JSON.stringify({
              broadcastRole: "moderator", // MVP: a moderadores/admins/superAdmins
              type: "campaign_new",
              title: "New campaign published",
              body: payload?.title ? String(payload.title) : slug,
              href: `/campaigns/${slug}`,
              meta: { campaignId: documentId, slug },
            }),
          });
          if (!res.ok) {
            logger.warn("[Revalidate] campaign notify failed", res.status);
          }
        }
      } catch (e) {
        logger.warn("[Revalidate] campaign notify error", e);
      }
    }

    // 🚀 MODO DESARROLLO: Revalidación extra agresiva
    if (isDevelopment) {
      logger.log("🔥 [Revalidate] Modo desarrollo: revalidación agresiva");

      // Revalidar todas las páginas principales en desarrollo
      for (const path of DEV_EXTRA_PATHS) {
        try {
          revalidatePath(path);
          if (!revalidated.paths.includes(path)) {
            revalidated.paths.push(path);
          }
          logger.log(`🔥 [Dev] Path extra revalidado: ${path}`);
        } catch (error) {
          logger.error(`❌ [Dev] Error revalidando path extra ${path}:`, error);
        }
      }

      // Revalidar tags principales en desarrollo
      const devTags = ["homepage", "conference", "campaign", "article"];
      for (const tag of devTags) {
        try {
          revalidateTag(tag);
          if (!revalidated.tags.includes(tag)) {
            revalidated.tags.push(tag);
          }
          logger.log(`🔥 [Dev] Tag extra revalidado: ${tag}`);
        } catch (error) {
          logger.error(`❌ [Dev] Error revalidando tag extra ${tag}:`, error);
        }
      }
    }

    const successMessage = `Revalidación completada para ${documentType}`;
    logger.log(`🎉 [Revalidate] ${successMessage}`, revalidated);

    return Response.json({
      message: successMessage,
      revalidated,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("💥 [Revalidate] Error general:", error);
    return Response.json(
      { message: "Revalidation failed", error: String(error) },
      { status: 500 }
    );
  }
}

// 🛠️ ENDPOINT MANUAL PARA FORZAR REVALIDACIÓN (solo desarrollo)
export async function GET(request: NextRequest) {
  if (!isDevelopment) {
    return Response.json(
      { message: "Only available in development" },
      { status: 404 }
    );
  }

  const type = request.nextUrl.searchParams.get("type");
  const path = request.nextUrl.searchParams.get("path");

  logger.log("🔧 [Manual Revalidate] Revalidación manual solicitada");

  try {
    const revalidated = {
      tags: [] as string[],
      paths: [] as string[],
      manual: true,
    };

    if (type) {
      revalidateTag(type);
      revalidated.tags.push(type);
      logger.log(`🔧 [Manual] Tag revalidado: ${type}`);
    }

    if (path) {
      revalidatePath(path);
      revalidated.paths.push(path);
      logger.log(`🔧 [Manual] Path revalidado: ${path}`);
    }

    // Si no se especifica nada, revalidar todo
    if (!type && !path) {
      for (const devPath of DEV_EXTRA_PATHS) {
        revalidatePath(devPath);
        revalidated.paths.push(devPath);
      }

      const allTags = [
        "homepage",
        "conference",
        "campaign",
        "article",
        "aboutPage",
        "volunteerPage",
      ];
      for (const tag of allTags) {
        revalidateTag(tag);
        revalidated.tags.push(tag);
      }

      logger.log("🔧 [Manual] Revalidación completa ejecutada");
    }

    return Response.json({
      message: "Manual revalidation completed",
      revalidated,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("💥 [Manual Revalidate] Error:", error);
    return Response.json(
      { message: "Manual revalidation failed", error: String(error) },
      { status: 500 }
    );
  }
}
