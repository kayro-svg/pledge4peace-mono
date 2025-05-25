import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Ticket, DollarSign, Handshake, Share } from "lucide-react";
import ConferenceTab from "../conference/conference-tab";
import { SanityConference, SanityWaysToSupportTab } from "@/lib/types";

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
  // Puedes personalizar el contenido para otros tipos si lo deseas
  return <div>{tab.content}</div>;
}

export default function WaysToSupport({
  waysToSupportTabs,
}: WaysToSupportProps) {
  const [subTab, setSubTab] = useState(waysToSupportTabs?.[0]?.type || "");

  return (
    <>
      <div className="flex flex-row gap-4 w-full">
        {waysToSupportTabs.map((tab) => (
          <Card
            key={tab.type}
            className={`cursor-pointer transition-all hover:shadow-md w-full ${
              subTab === tab.type ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSubTab(tab.type)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">{getTabIcon(tab.type)}</span>
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
        <CardContent className="p-6">
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

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useState } from "react";
// import { Ticket, DollarSign, Handshake, Share } from "lucide-react";
// import ConferenceTab from "../conference/conference-tab";
// import { SanityWaysToSupportTab } from "@/lib/types";

// interface WaysToSupportProps {
//   mainTab: string;
//   campaignSlug?: string;
//   waysToSupportTabs: SanityWaysToSupportTab[];
// }

// export default function WaysToSupport({
//   mainTab,
//   campaignSlug,
//   waysToSupportTabs,
// }: WaysToSupportProps) {
//   const subTabs = {
//     "ways-to-support": [
//       {
//         id: "conference",
//         label: "Conference",
//         icon: (
//           <div className="p-1 rounded-full border-2 border-[#548281] text-[#548281] flex items-center justify-center">
//             <Ticket className="w-4 h-4" />
//           </div>
//         ),
//         description: "Join our annual conference",
//         content: <ConferenceTab campaignSlug={campaignSlug} />,
//       },
//       {
//         id: "donations",
//         label: "Donations",
//         icon: (
//           <div className="p-1 rounded-full border-2 border-[#548281] text-[#548281] flex items-center justify-center">
//             <DollarSign className="w-4 h-4" />
//           </div>
//         ),
//         description: "Support our cause financially",
//         // content: <DonationsTab campaignSlug={campaignSlug} />,
//         content: <div>Donations</div>,
//       },
//       {
//         id: "volunteering",
//         label: "Volunteering",
//         icon: (
//           <div className="p-1 rounded-full border-2 border-[#548281] text-[#548281] flex items-center justify-center">
//             <Handshake className="w-4 h-4" />
//           </div>
//         ),
//         description: "Offer your time and skills",
//         // content: <VolunteeringTab campaignSlug={campaignSlug} />,
//         content: <div>Volunteering</div>,
//       },
//       {
//         id: "share",
//         label: "Share",
//         icon: (
//           <div className="p-1 rounded-full border-2 border-[#548281] text-[#548281] flex items-center justify-center">
//             <Share className="w-4 h-4" />
//           </div>
//         ),
//         description: "Explore other ways to help",
//         // content: <ShareTab campaignSlug={campaignSlug} />,
//         content: <div>Share</div>,
//       },
//     ],
//   };

//   const [subTab, setSubTab] = useState(
//     subTabs[mainTab as keyof typeof subTabs]?.[0]?.id || ""
//   );

//   return (
//     <>
//       <div className="flex flex-row gap-4 w-full">
//         {subTabs[mainTab as keyof typeof subTabs]?.map((tab) => (
//           <Card
//             key={tab.id}
//             className={`cursor-pointer transition-all hover:shadow-md w-full ${
//               subTab === tab.id ? "ring-2 ring-primary" : ""
//             }`}
//             onClick={() => setSubTab(tab.id)}
//           >
//             <CardHeader className="p-4">
//               <CardTitle className="text-lg flex items-center gap-2">
//                 <span className="text-2xl">{tab.icon}</span>
//                 {tab.label}
//               </CardTitle>
//               <CardDescription className="text-xs">
//                 {tab.description}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="p-4 pt-0">
//               {subTab === tab.id && (
//                 <div className="h-1 w-full bg-primary rounded-full mt-2"></div>
//               )}
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <Card className="mt-6">
//         <CardContent className="p-6">
//           {
//             subTabs[mainTab as keyof typeof subTabs]?.find(
//               (t) => t.id === subTab
//             )?.content
//           }
//         </CardContent>
//       </Card>
//     </>
//   );
// }
