import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Ticket, DollarSign, Handshake, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import DonationModal from "@/components/donations/DonationModal";
import ConferenceTab from "./conference/conference-tab";
import VolunteeringTab from "./volunteering/volunteering-tab";
import ShareTab from "./share/share-tab";
import { SanityWaysToSupportTab } from "@/lib/types";

interface WaysToSupportProps {
  waysToSupportTabs: SanityWaysToSupportTab[];
  campaignSlug?: string;
  campaignTitle?: string;
}

function DonateTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-start gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#2F4858]">
            Support Peace Initiatives
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-[#2F4858]/80 leading-relaxed">
              Your donation helps us expand our reach and strengthen
              peace-building efforts worldwide. Whether one-time or monthly,
              every contribution makes a difference.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-[#2F4858]/80">
                <DollarSign className="w-4 h-4 mt-1 text-[#548281]" />
                <span>Fund peace-building campaigns and initiatives</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-[#2F4858]/80">
                <DollarSign className="w-4 h-4 mt-1 text-[#548281]" />
                <span>Support operational costs and outreach programs</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-[#2F4858]/80">
                <DollarSign className="w-4 h-4 mt-1 text-[#548281]" />
                <span>
                  Enable us to organize more peace conferences and events
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            className="bg-[#548281] hover:bg-[#3c6665] w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Make a Donation
          </Button>
          <p className="text-xs text-[#2F4858]/60 text-center sm:text-left">
            Secure payments • Tax deductible • Transparent impact
          </p>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

function getTabIcon(type: string) {
  switch (type) {
    case "conference":
      return (
        <div className="p-1 rounded-full border-2 border-[#548281] text-[#548281] flex items-center justify-center">
          <Ticket className="w-4 h-4" />
        </div>
      );
    case "donations":
      return (
        <div className="p-1 rounded-full border-2 border-[#548281] text-[#548281] flex items-center justify-center">
          <DollarSign className="w-4 h-4" />
        </div>
      );
    case "volunteering":
      return (
        <div className="p-1 rounded-full border-2 border-[#548281] text-[#548281] flex items-center justify-center">
          <Handshake className="w-4 h-4" />
        </div>
      );
    case "share":
      return (
        <div className="p-1 rounded-full border-2 border-[#548281] text-[#548281] flex items-center justify-center">
          <Share className="w-4 h-4" />
        </div>
      );
    default:
      return null;
  }
}

function getTabContent(
  tab: SanityWaysToSupportTab,
  campaignSlug?: string,
  campaignTitle?: string
) {
  if (tab.type === "conference") {
    // Puedes pasar conferenceRef o conferenceDetails si lo necesitas
    return <ConferenceTab conferenceRef={tab.conferenceRef} />;
  }
  if (tab.type === "volunteering") {
    return <VolunteeringTab />;
  }
  if (tab.type === "share") {
    return (
      <ShareTab campaignSlug={campaignSlug} campaignTitle={campaignTitle} />
    );
  }
  if (tab.type === "donations") {
    return <DonateTab />;
  }
  // Puedes personalizar el contenido para otros tipos si lo deseas
  return <div>{tab.content}</div>;
}

export default function WaysToSupport({
  waysToSupportTabs,
  campaignSlug,
  campaignTitle,
}: WaysToSupportProps) {
  // Ensure a Donate tab is always present
  const donationTab: SanityWaysToSupportTab = {
    type: "donations",
    title: "Donate",
    content: "Support our peace-building initiatives with a donation",
  };

  const tabsWithDonation = (
    waysToSupportTabs && waysToSupportTabs.length > 0
      ? (() => {
          const hasDonation = waysToSupportTabs.some(
            (t) => t.type === "donations"
          );
          return hasDonation
            ? waysToSupportTabs
            : [...waysToSupportTabs, donationTab];
        })()
      : [donationTab]
  ) as SanityWaysToSupportTab[];

  const [subTab, setSubTab] = useState(tabsWithDonation[0].type);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 w-full">
        {tabsWithDonation.map((tab) => (
          <Card
            key={tab.type}
            className={`cursor-pointer transition-all hover:shadow-md w-full ${
              subTab === tab.type ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSubTab(tab.type)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base md:text-lg flex flex-col items-start gap-2">
                <span className="text-xl">{getTabIcon(tab.type)}</span>
                {tab.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {tab.conferenceDetails?.description || tab.content}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {subTab === tab.type && (
                <div className="h-1 w-full bg-primary rounded-full mt-2"></div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-3 md:p-6">
          {tabsWithDonation
            .filter((t) => t.type === subTab)
            .map((tab) => (
              <div key={tab.type}>
                {getTabContent(tab, campaignSlug, campaignTitle)}
              </div>
            ))}
        </CardContent>
      </Card>
    </>
  );
}
