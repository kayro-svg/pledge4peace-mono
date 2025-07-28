"use client";

import { Campaign, SanityHomePage } from "@/lib/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import ArticlesSection from "./articles-section";
import ConferencesSection from "./conferences-section";
import HeroSection from "./hero/hero-section";
import HowItWorksSection from "./how-it-works-section";
import ProjectsSection from "./projects-section";
import WaysToSupportSection from "./ways-to-support";
// import { PayPalDonatePortal } from "@/components/ui/paypal-donate-portal";

interface HomeSectionsPageProps {
  data: SanityHomePage;
  campaigns: Campaign[];
}

export default function HomeSectionsPage({
  data,
  campaigns,
}: HomeSectionsPageProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Solo hacemos scroll cuando estamos en la ruta "/" y el hash es "#projects-section"
    if (pathname === "/" && window.location.hash === "#projects-section") {
      const el = document.getElementById("projects-section");
      if (el) {
        // Desplazamiento suave
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname, searchParams]);

  return (
    <main className="min-h-screen bg-[#FDFDF0] w-full">
      <HeroSection data={data.heroSection} />
      {/* <PayPalDonatePortal
        hostedButtonId="FLZCUFCT6RYUW"
        env="production"
        // className="fixed top-4 right-4 z-50"
      /> */}
      <HowItWorksSection data={data.howItWorksSection} />

      {/* Esta sección tiene id="projects-section" internamente */}
      <ProjectsSection data={data.campaignsSection} campaigns={campaigns} />

      <WaysToSupportSection data={data.waysToSupportSection} />
      <ArticlesSection data={data.articlesSection} />
      <ConferencesSection data={data.conferencesSection} />
    </main>
  );
}
