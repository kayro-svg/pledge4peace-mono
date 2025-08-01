import { CampaignDetailContent } from "./campaign-detail-content";
import { getCampaignBySlug, getCampaignSlugs } from "@/lib/sanity/queries";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { logger } from "@/lib/utils/logger";

// Enable Incremental Static Regeneration with a revalidation period of 60 seconds
// export const revalidate = 60;
export const dynamic = "force-dynamic";

// Esta función genera estáticamente las rutas en tiempo de compilación
// export async function generateStaticParams() {
//   const campaigns = await getCampaignSlugs();
//   return campaigns
//     .filter(
//       (slug) => typeof slug?.current === "string" && slug.current.length > 0
//     )
//     .map((slug) => ({ slug: slug.current }));
// }

// export async function generateStaticParams() {
//   const campaigns = await getCampaignSlugs();

//   // Ensure we include the locale segment so that
//   // /en/... y /es/... se pre-generen y tengan su JSON
//   const locales = routing.locales ?? ["en"];

//   const validSlugs = campaigns.filter(
//     (s) => typeof s?.current === "string" && s.current.length > 0
//   );

//   return locales.flatMap((locale) =>
//     validSlugs.map((slug) => ({ locale, slug: slug.current }))
//   );
// }

export async function generateStaticParams() {
  const slugs = await getCampaignSlugs(); // [{slug:{current:'create-...'}}]
  const locales = ["en", "es"]; // ajusta según i18n
  return locales.flatMap((locale) =>
    slugs
      .filter((s) => s?.slug?.current)
      .map((s) => ({ locale, slug: s.slug.current }))
  );
}

export default async function Page({
  params,
}: {
  params:
    | { locale: string; slug: string }
    | Promise<{ locale: string; slug: string }>;
}) {
  // Handle both Promise and direct params objects to ensure compatibility
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale, slug } = resolvedParams;

  logger.log(`[Campaign Page] Fetching campaign data for slug: ${slug}`);

  // Fetch campaign data with caching enabled via revalidate
  const campaign = await getCampaignBySlug(slug);

  // If campaign doesn't exist, show 404
  if (!campaign) {
    logger.log(`[Campaign Page] Campaign not found for slug: ${slug}`);
    notFound();
  }

  logger.log(
    `[Campaign Page] Successfully loaded campaign: ${campaign?.title}`
  );

  // Pass campaign data to the client component
  return <CampaignDetailContent campaign={campaign} locale={locale} />;
}
