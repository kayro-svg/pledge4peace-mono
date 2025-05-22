import ArticlesSection from "@/components/sections/articles-section";
import ConferencesSection from "@/components/sections/conferences-section";
import HeroSection from "@/components/sections/hero/hero-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import ProjectsSection from "@/components/sections/projects-section";
import WaysToSupportSection from "@/components/sections/ways-to-support";
import { HomePageData } from "@/lib/types";
import { getHomePageData } from "@/lib/sanity/queries";

export default async function Home(): Promise<JSX.Element> {
  const data = (await getHomePageData()) as HomePageData;
  return (
    <main className="min-h-screen bg-[#FDFDF0]">
      <HeroSection data={data} />
      <HowItWorksSection />
      <ProjectsSection />
      <WaysToSupportSection />
      <ArticlesSection />
      <ConferencesSection />
    </main>
  );
}
