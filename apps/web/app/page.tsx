import ArticlesSection from "@/components/sections/articles-section";
import ConferencesSection from "@/components/sections/conferences-section";
import HeroSection from "@/components/sections/hero/hero-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import ProjectsSection from "@/components/sections/projects-section";
import WaysToSupportSection from "@/components/sections/ways-to-support";
import { getHomePageData } from "@/lib/sanity/queries";

export default async function Home(): Promise<JSX.Element> {
  // Una única petición a Sanity que obtiene todos los datos
  const homeData = await getHomePageData();
  // Extraer cada sección para pasarla al componente correspondiente

  return (
    <main className="min-h-screen bg-[#FDFDF0]">
      <HeroSection data={homeData.heroSection} />
      <HowItWorksSection data={homeData.howItWorksSection} />
      <ProjectsSection data={homeData.campaignsSection} />
      <WaysToSupportSection data={homeData.waysToSupportSection} />
      <ArticlesSection data={homeData.articlesSection} />
      <ConferencesSection data={homeData.conferencesSection} />
    </main>
  );
}
