import HeroVolunteerBanner from "@/components/volunteer/hero-volunteer-banner";
import HighProfileOutreach from "@/components/volunteer/high-profile-outreach";
import JoinOurTeamForm from "@/components/volunteer/join-our-team-form";
import SpreadWordSection from "@/components/volunteer/spread-word-section";
import VolunteerCtaBanner from "@/components/volunteer/volunteer-cta-banner";
import VolunteerImpactMetrics from "@/components/volunteer/volunteer-impact-metrics";
import WaysToVolunteer from "@/components/volunteer/ways-to-volunteer";
import { Handshake, Megaphone, Users } from "lucide-react";

export default function VolunteerPage(): JSX.Element {
  const volunteerWays = [
    {
      icon: <Users className="h-8 w-8 text-[#548281]" />,
      title: "High-Profile Outreach",
      description:
        "Connect with celebrities, politicians, and influential figures to expand our reach and impact.",
      learnMore: "#high-profile",
    },
    {
      icon: <Megaphone className="h-8 w-8 text-[#548281]" />,
      title: "Community Campaigns",
      description:
        "Launch local initiatives that spread our message of peace through neighborhood outreach and engagement.",
      learnMore: "#spread-word",
    },
    {
      icon: <Handshake className="h-8 w-8 text-[#548281]" />,
      title: "Strategic Partnerships",
      description:
        "Help us form alliances with organizations that share our mission to achieve greater collective impact.",
      learnMore: "#partnerships",
    },
  ];

  const impactMetrics = [
    {
      value: "4.5x",
      description: "More peaceful communities through volunteer initiatives",
    },
    {
      value: "1000+",
      description: "Active volunteers worldwide making a difference",
    },
    {
      value: "24/7",
      description: "Support network for our volunteer community",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FDFDF0]">
      <HeroVolunteerBanner />
      <WaysToVolunteer volunteerWays={volunteerWays} />
      <VolunteerImpactMetrics impactMetrics={impactMetrics} />
      <HighProfileOutreach />
      <SpreadWordSection />
      {/* <PartnerWithUs /> */}
      <VolunteerCtaBanner />
      <JoinOurTeamForm />
    </main>
  );
}
