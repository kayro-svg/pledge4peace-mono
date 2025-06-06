import HomeSectionsPage from "@/components/home-sections/home-sections-page";
import { getHomePageData } from "@/lib/sanity/queries";
import { getCampaigns } from "@/lib/api";
import { Suspense } from "react";

export default async function Home(): Promise<JSX.Element> {
  // Una única petición a Sanity que obtiene todos los datos
  const homeData = await getHomePageData();
  const campaigns = await getCampaigns();
  // Extraer cada sección para pasarla al componente correspondiente

  return (
    <main className="min-h-screen bg-[#FDFDF0] w-full">
      <Suspense fallback={<div>Loading...</div>}>
        <HomeSectionsPage data={homeData} campaigns={campaigns} />
      </Suspense>
    </main>
  );
}
