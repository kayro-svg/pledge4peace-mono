import HeroSection from "@/components/sections/hero-section";
import StatsSection from "@/components/sections/stats-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import ProjectsSection from "@/components/sections/projects-section";
import LeadersSection from "@/components/sections/leaders-section";
import ArticlesSection from "@/components/sections/articles-section";
import ConferencesSection from "@/components/sections/conferences-section";
import WaysToSupportSection from "@/components/sections/ways-to-support";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDFDF0]">
      <HeroSection />
      <HowItWorksSection />
      <ProjectsSection />
      <WaysToSupportSection />
      <ArticlesSection />
      <ConferencesSection />
    </main>
  );
}
