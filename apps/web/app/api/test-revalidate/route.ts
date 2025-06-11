import { logger } from "@/lib/utils/logger";
import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Verificar el secret de revalidación
    const secret = req.nextUrl.searchParams.get("secret");

    if (!secret || secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: "Invalid or missing revalidation secret" },
        { status: 401 }
      );
    }

    // Obtener parámetros de query para testing
    const tag = req.nextUrl.searchParams.get("tag");
    const path = req.nextUrl.searchParams.get("path");

    if (tag) {
      revalidateTag(tag);
      logger.log(`[Test] Revalidated tag: ${tag}`);
    }

    if (path) {
      revalidatePath(path);
      logger.log(`[Test] Revalidated path: ${path}`);
    }

    // Por defecto, revalidar homepage
    if (!tag && !path) {
      revalidateTag("homePage");
      revalidatePath("/");
      logger.log("[Test] Revalidated homepage (default)");
    }

    return NextResponse.json({
      message: "Test revalidation completed",
      revalidated: true,
      tag: tag || null,
      path: path || null,
      now: Date.now(),
    });
  } catch (error) {
    console.error("[Test] Error during revalidation:", error);
    return NextResponse.json(
      { message: "Internal server error", revalidated: false },
      { status: 500 }
    );
  }
}
