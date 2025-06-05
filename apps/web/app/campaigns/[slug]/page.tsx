import { CampaignDetailContent } from "./campaign-detail-content";
import { getCampaignBySlug, getCampaignSlugs } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";

// Enable Incremental Static Regeneration with a revalidation period of 60 seconds
export const revalidate = 60;

// Esta función genera estáticamente las rutas en tiempo de compilación
export async function generateStaticParams() {
  const campaigns = await getCampaignSlugs();
  return campaigns
    .filter(
      (slug) => typeof slug?.current === "string" && slug.current.length > 0
    )
    .map((slug) => ({ slug: slug.current }));
}

export default async function Page({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  // Handle both Promise and direct params objects to ensure compatibility
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  console.log(`[Campaign Page] Fetching campaign data for slug: ${slug}`);

  // Fetch campaign data with caching enabled via revalidate
  const campaign = await getCampaignBySlug(slug);

  // If campaign doesn't exist, show 404
  if (!campaign) {
    console.log(`[Campaign Page] Campaign not found for slug: ${slug}`);
    notFound();
  }

  console.log(
    `[Campaign Page] Successfully loaded campaign: ${campaign?.title}`
  );

  // Pass campaign data to the client component
  return <CampaignDetailContent campaign={campaign} />;
}
