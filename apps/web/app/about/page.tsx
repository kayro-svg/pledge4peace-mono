import HeroBanner from "@/components/about/hero-banner";
import PartnershipsSection from "@/components/about/partnerships-section";
import WhoWeAre from "@/components/about/who-we-are";
import ImpactStats from "@/components/about/impact-stats";
import MissionPhilosophy from "@/components/about/mission-philosophy";
import NonprofitMission from "@/components/about/nonprofit-mission";
import ContactInformationAndCommitment from "@/components/about/contact-information";
import { getAboutPageData } from "@/lib/sanity/queries";

export default async function AboutPage() {
  // Fetch data from Sanity CMS
  const aboutData = await getAboutPageData();

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
