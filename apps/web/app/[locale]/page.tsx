import { getTranslations } from "next-intl/server";
import { fetchLocalizedData } from "@/lib/sanity/client";
// import { homePageQuery } from "@/lib/sanity/queries";
import { LocalizedContent } from "@/components/sanity/localized-content";
import { Suspense } from "react";
import { HomePageSkeleton } from "@/components/ui/home-skeleton";
import HomeSectionsPage from "@/components/home-sections/home-sections-page";
import { getHomePageData } from "@/lib/sanity/queries";
import { getCampaigns } from "@/lib/api";
import { SanityHomePage } from "@/lib/types";

// Define types for the data structure
type HomePageData = {
  heroHeading: { en: string; es: string };
  heroSubheading: { en: string; es: string };
  heroImage?: { asset: { _id: string; url: string } };
  howItWorksHeading: { en: string; es: string };
  howItWorksDescription: { en: string; es: string };
};

export default async function HomePage({
  params,
}: {
  params: { locale: any };
}) {
  const { locale } = params;

  // Fetch data with the current locale
  const homeData = await getHomePageData(locale as "en" | "es");
  console.log("homeData", homeData);

  const campaigns = await getCampaigns();

  return (
    <main className="min-h-screen">
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeSectionsPage data={homeData} campaigns={campaigns} />
      </Suspense>
      {/* <section className="hero-section py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-4">{t("welcome")}</h1>

          <div className="mt-12">
            <LocalizedContent
              title={homeData.heroHeading}
              description={homeData.heroSubheading}
            />
          </div>
        </div>
      </section> */}
      {/* 
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">{t("howItWorks")}</h2>

          <LocalizedContent
            title={homeData.howItWorksHeading}
            description={homeData.howItWorksDescription}
          />
        </div>
      </section> */}
    </main>
  );
}
