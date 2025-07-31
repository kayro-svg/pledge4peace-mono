import HeroVolunteerBanner from "@/components/volunteer/hero-volunteer-banner";
import HighProfileOutreach from "@/components/volunteer/high-profile-outreach";
import JoinOurTeamForm from "@/components/volunteer/join-our-team-form";
import SpreadWordSection from "@/components/volunteer/spread-word-section";
import VolunteerCtaBanner from "@/components/volunteer/volunteer-cta-banner";
import VolunteerImpactMetrics from "@/components/volunteer/volunteer-impact-metrics";
import WaysToVolunteer from "@/components/volunteer/ways-to-volunteer";
import { Handshake, Megaphone, Users } from "lucide-react";
import { getVolunteerPageData } from "@/lib/sanity/queries";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function VolunteerPage({
  params,
}: {
  params: { locale: any };
}) {
  const { locale } = params;
  // Fetch data from Sanity CMS
  const volunteerData = await getVolunteerPageData(locale as "en" | "es");

  console.log("volunteerData", volunteerData);
  // Define icons for volunteer ways (assigned by index)
  const volunteerIcons = [
    <Users key="users" className="h-8 w-8 text-[#548281]" />,
    <Megaphone key="megaphone" className="h-8 w-8 text-[#548281]" />,
    <Handshake key="handshake" className="h-8 w-8 text-[#548281]" />,
  ];

  return (
    <div className="min-h-screen">
      <HeroVolunteerBanner heroSection={volunteerData.heroSection} />
      <JoinOurTeamForm />
      <WaysToVolunteer
        waysToVolunteerSection={volunteerData.waysToVolunteerSection}
        icons={volunteerIcons}
      />
      {/* <VolunteerImpactMetrics impactMetrics={impactMetrics} /> */}
      <HighProfileOutreach
        convinceHighProfileSection={volunteerData.convinceHighProfileSection}
      />
      <SpreadWordSection
        spreadTheWordSection={volunteerData.spreadTheWordSection}
      />
      {/* <PartnerWithUs /> */}
      <VolunteerCtaBanner impactSection={volunteerData.impactSection} />
    </div>
  );
}
