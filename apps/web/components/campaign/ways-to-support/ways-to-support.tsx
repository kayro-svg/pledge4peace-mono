import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Ticket, DollarSign, Handshake, Share } from "lucide-react";
import ConferenceTab from "./conference/conference-tab";
import VolunteeringTab from "./volunteering/volunteering-tab";
import ShareTab from "./share/share-tab";
import { SanityWaysToSupportTab } from "@/lib/types";

interface WaysToSupportProps {
  waysToSupportTabs: SanityWaysToSupportTab[];
  campaignSlug?: string;
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

function getTabContent(tab: SanityWaysToSupportTab) {
  if (tab.type === "conference") {
    // Puedes pasar conferenceRef o conferenceDetails si lo necesitas
    return <ConferenceTab conferenceRef={tab.conferenceRef} />;
  }
  if (tab.type === "volunteering") {
    return <VolunteeringTab />;
  }
  if (tab.type === "share") {
    return <ShareTab />;
  }
  // Puedes personalizar el contenido para otros tipos si lo deseas
  return <div>{tab.content}</div>;
}

export default function WaysToSupport({
  waysToSupportTabs,
}: WaysToSupportProps) {
  const [subTab, setSubTab] = useState(waysToSupportTabs?.[0]?.type || "");

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 w-full">
        {waysToSupportTabs.map((tab) => (
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
          {waysToSupportTabs
            .filter((t) => t.type === subTab)
            .map((tab) => (
              <div key={tab.type}>{getTabContent(tab)}</div>
            ))}
        </CardContent>
      </Card>
    </>
  );
}
