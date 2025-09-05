import { CampaignDetailContent } from "./campaign-detail-content";
import { getCampaignBySlug, getCampaignSlugs } from "@/lib/sanity/queries";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { logger } from "@/lib/utils/logger";
import { Metadata } from "next";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getCampaignSlugs();
  const locales = ["en", "es"]; 
  return locales.flatMap((locale) =>
    slugs
      .filter((s) => s?.slug?.current)
      .map((s) => ({ locale, slug: s.slug.current }))
  );
}

// Generate metadata for campaigns with Twitter Cards and Open Graph
export async function generateMetadata({
  params,
}: {
  params:
    | { locale: string; slug: string }
    | Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale, slug } = resolvedParams;

  const campaign = await getCampaignBySlug(
    slug,
    (locale as "en" | "es") || "en"
  );

  if (!campaign) {
    return {
      title: "Campaign Not Found",
      description: "The requested campaign could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pledge4peace.org";
  const campaignUrl = `${baseUrl}/${locale}/campaigns/${campaign.slug.current}`;
  
  // Get campaign image
  const campaignImage = campaign.featuredImage?.asset?.url
    ? getSanityImageUrl(campaign.featuredImage.asset.url, 1200, 630, 80)
    : `${baseUrl}/p4p_logo_renewed.png`;

  // Create title and description
  const title = `${campaign.title} | Pledge4Peace Campaign`;
  const description = campaign.description || 
    `Join our campaign: ${campaign.title}. Take action for peace and democracy.`;

  return {
    title,
    description,
    keywords: `peace campaign, ${campaign.title}, democracy, human rights, social justice, global action`,
    authors: [{ name: "Pledge4Peace" }],
    creator: "Pledge4Peace",
    publisher: "Pledge4Peace",

    // Open Graph metadata for Facebook and other social platforms
    openGraph: {
      title,
      description,
      url: campaignUrl,
      siteName: "Pledge4Peace",
      images: [
        {
          url: campaignImage,
          width: 1200,
          height: 630,
          alt: campaign.title,
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "article", // Using article for campaigns as they're content pieces
    },

    // Twitter Card metadata
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [campaignImage],
      creator: "@Pledge4Peace",
      site: "@Pledge4Peace",
    },

    // Additional SEO
    alternates: {
      canonical: campaignUrl,
    },

    // Control indexing
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },

    // Campaign specific metadata
    other: {
      "article:published_time": campaign._createdAt,
      "article:author": "Pledge4Peace Team",
      "article:section": "Peace Campaigns",
      "og:see_also": [
        "https://www.youtube.com/@Pledge4Peace",
        "https://www.linkedin.com/groups/14488545/",
        "https://www.facebook.com/share/1F8FxiQ6Hh/",
        "https://x.com/pledge4peaceorg",
        "https://www.instagram.com/pledge4peaceorg",
        "https://www.tiktok.com/@pledge4peace5"
      ].join(","),
    },
  };
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
  const campaign = await getCampaignBySlug(
    slug,
    (locale as "en" | "es") || "en"
  );

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
