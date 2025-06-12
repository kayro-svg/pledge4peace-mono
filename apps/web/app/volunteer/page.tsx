import HeroVolunteerBanner from "@/components/volunteer/hero-volunteer-banner";
import HighProfileOutreach from "@/components/volunteer/high-profile-outreach";
import JoinOurTeamForm from "@/components/volunteer/join-our-team-form";
import SpreadWordSection from "@/components/volunteer/spread-word-section";
import VolunteerCtaBanner from "@/components/volunteer/volunteer-cta-banner";
import VolunteerImpactMetrics from "@/components/volunteer/volunteer-impact-metrics";
import WaysToVolunteer from "@/components/volunteer/ways-to-volunteer";
import { Handshake, Megaphone, Users } from "lucide-react";
import { getVolunteerPageData } from "@/lib/sanity/queries";

export default async function VolunteerPage(): Promise<JSX.Element> {
  // Fetch data from Sanity CMS
  const volunteerData = await getVolunteerPageData();
  // Define icons for volunteer ways (assigned by index)
  const volunteerIcons = [
    <Users key="users" className="h-8 w-8 text-[#548281]" />,
    <Megaphone key="megaphone" className="h-8 w-8 text-[#548281]" />,
    <Handshake key="handshake" className="h-8 w-8 text-[#548281]" />,
  ];

  // const impactMetrics = [
  //   {
  //     value: "4.5x",
  //     description: "More peaceful communities through volunteer initiatives",
  //   },
  //   {
  //     value: "1000+",
  //     description: "Active volunteers worldwide making a difference",
  //   },
  //   {
  //     value: "24/7",
  //     description: "Support network for our volunteer community",
  //   },
  // ];

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
