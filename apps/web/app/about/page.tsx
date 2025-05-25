import HeroBanner from "@/components/about/hero-banner";
import PartnershipsSection from "@/components/about/partnerships-section";
import WhoWeAre from "@/components/about/who-we-are";
import ImpactStats from "@/components/about/impact-stats";
import MissionPhilosophy from "@/components/about/mission-philosophy";
import NonprofitMission from "@/components/about/nonprofit-mission";
import ContactInformation from "@/components/about/contact-information";
import { getAbout } from "@/lib/api";
import { MainAboutPage } from "@/lib/types";

export default async function AboutPage() {
  const aboutData = await getAbout("main");

  // Get data from the API
  const hasSections = "sections" in aboutData;
  const sections = hasSections ? (aboutData as MainAboutPage).sections : [];

  const hasIntroParagraphs = "intro_paragraphs" in aboutData;
  const introParagraphs = hasIntroParagraphs
    ? (aboutData as MainAboutPage & { intro_paragraphs: string[] })
        .intro_paragraphs
    : [];

  const hasCharterPoints = "charter_points" in aboutData;
  const charterPoints = hasCharterPoints
    ? (aboutData as MainAboutPage & { charter_points: string[] }).charter_points
    : [];

  const hasPartnershipsText = "partnerships_text" in aboutData;
  const partnershipsText = hasPartnershipsText
    ? (aboutData as MainAboutPage & { partnerships_text: string })
        .partnerships_text
    : "";

  return (
    <main className="min-h-screen bg-[#FDFDF0]">
      <HeroBanner
        title={aboutData.title}
        content={aboutData.content}
        noButton
      />
      <WhoWeAre
        hasIntroParagraphs={hasIntroParagraphs}
        introParagraphs={introParagraphs}
      />

      <div className="container mx-auto px-4 max-w-6xl py-16">
        {/* <ImpactStats /> */}

        {hasSections && sections.length > 0 && (
          <MissionPhilosophy
            sections={sections}
            hasCharterPoints={hasCharterPoints}
            charterPoints={charterPoints}
          />
        )}

        {/* Partnerships Section */}
        {/* {hasPartnershipsText && partnershipsText && (
          <PartnershipsSection partnershipText={partnershipsText} />
        )} */}

        <NonprofitMission />
        <ContactInformation />
      </div>
    </main>
  );
}
