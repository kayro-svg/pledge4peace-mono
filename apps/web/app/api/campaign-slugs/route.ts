import { NextRequest } from "next/server";
import { getCampaignIdSlugMap } from "@/lib/sanity/queries";

export const revalidate = 3600; // ISR: 1h

export async function GET(
  _req: NextRequest,
  context: { params: { locale: "en" | "es" } }
) {
  try {
    const locale = (context?.params?.locale || "en") as "en" | "es";
    const map = await getCampaignIdSlugMap(locale);
    return new Response(JSON.stringify(map), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to load slugs" }), {
      headers: { "content-type": "application/json" },
      status: 500,
    });
  }
}
