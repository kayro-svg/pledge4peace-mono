import HeroBanner from "@/components/about/hero-banner";
import PartnershipsSection from "@/components/about/partnerships-section";
import WhoWeAre from "@/components/about/who-we-are";
import ImpactStats from "@/components/about/impact-stats";
import MissionPhilosophy from "@/components/about/mission-philosophy";
import NonprofitMission from "@/components/about/nonprofit-mission";
import ContactInformationAndCommitment from "@/components/about/contact-information";
import { getAboutPageData } from "@/lib/sanity/queries";

// Define types for the data structure
// type AboutPageData = {
//   heroSection: {
//     heroHeading: { en: string; es: string };
//     heroSubheading: { en: string; es: string };
//     heroBgImage?: { asset: { _id: string; url: string } };
//   };
//   whoWeAreSection: {
//     whoWeAreHeading: { en: string; es: string };
//     whoWeAreFirstParagraph: { en: string; es: string };
//     whoWeAreSecondParagraph: { en: string; es: string };
//     whoWeAreThirdParagraph: { en: string; es: string };
//     whoWeAreImage?: { asset: { _id: string; url: string } };
//   };
//   ourMissionSection: {
//     ourMissionHeading: { en: string; es: string };
//     ourMissionParagraph: { en: string; es: string };
//     ourMissionImage?: { asset: { _id: string; url: string } };
//   };
//   ourPhilosophySection: {
//     ourPhilosophyHeading: { en: string; es: string };
//     ourPhilosophyParagraph: { en: string; es: string };
//     ourPhilosophyImage?: { asset: { _id: string; url: string } };
//   };
// };

// Generate static params for locales
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function AboutPage({
  params,
}: {
  params: { locale: any };
}) {
  const { locale } = params;

  // Fetch data with the current locale
  const aboutData = await getAboutPageData(locale as "en" | "es");

  return (
    <main className="min-h-screen bg-[#FDFDF0]">
      <HeroBanner heroSection={aboutData.heroSection} noButton />
      <WhoWeAre whoWeAreSection={aboutData.whoWeAreSection} />

      <div className="container mx-auto px-4 max-w-6xl py-0">
        {/* <ImpactStats /> */}

        <MissionPhilosophy
          ourMissionSection={aboutData.ourMissionSection}
          ourPhilosophySection={aboutData.ourPhilosophySection}
          ourCharterSection={aboutData.ourCharterSection}
        />

        {/* Partnerships Section */}
        {/* <PartnershipsSection /> */}

        <NonprofitMission
          missionHighlightCard={aboutData.missionHighlightCard}
          // ourCommitmentCard={aboutData.ourCommitmentCard}
        />
        <ContactInformationAndCommitment
          getInTouchCard={aboutData.getInTouchCard}
          ourCommitmentCard={aboutData.ourCommitmentCard}
        />
      </div>
    </main>
  );
}
