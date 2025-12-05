import HomeSectionsPage from "@/components/home-sections/home-sections-page";
import { HomePageSkeleton } from "@/components/ui/home-skeleton";
import { getCampaigns } from "@/lib/api";
import { getHomePageData } from "@/lib/sanity/queries";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";

const getHomePageDataCached = unstable_cache(
  async (locale: "en" | "es") => getHomePageData(locale),
  (locale) => [`home:${locale}`],
  { revalidate: 1800 }
);

const getCampaignsCached = unstable_cache(
  async () => getCampaigns(),
  ["campaigns"],
  { revalidate: 600 }
);

export default async function HomePage({
  params,
}: {
  params: { locale: any } | Promise<{ locale: any }>;
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;

  // Fetch data with the current locale
  // const homeData = await getHomePageData(locale as "en" | "es");

  // const campaigns = await getCampaigns();

  const homeData = await getHomePageDataCached(locale as "en" | "es");
  const campaigns = await getCampaignsCached();

  return (
    <main className="min-h-screen">
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeSectionsPage data={homeData} campaigns={campaigns} />
      </Suspense>
    </main>
  );
}
