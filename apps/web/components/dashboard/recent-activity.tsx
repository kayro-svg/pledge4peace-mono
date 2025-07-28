"use client";

import CampaignCard from "@/components/ui/campaign-card";
import { SanityCampaign } from "@/lib/types";

interface RecentActivityProps {
  campaignsPledged: SanityCampaign[];
  campaignsNotPledged: SanityCampaign[];
}

export function RecentActivity({
  campaignsPledged,
  campaignsNotPledged,
}: RecentActivityProps) {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold ">Your activity</h1>
          <p className="text-sm text-gray-500">
            Here are the latest campaigns based on your pledge history. Check
            their progress and explore more ways to support them.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaignsPledged.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaignId={campaign._id}
                featuredImage={campaign.featuredImage?.asset?.url as string}
                title={campaign.title}
                description={campaign.description}
                action="View campaign"
                link={campaign.slug.current}
                // campaignType="your-activity"
                variant="horizontal"
                category={campaign.category || ""}
                goal={campaign.goalPledges}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold ">Recommended for you</h1>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaignsNotPledged.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaignId={campaign._id}
                featuredImage={campaign.featuredImage?.asset?.url as string}
                title={campaign.title}
                description={campaign.description}
                link={campaign.slug.current}
                variant="compact"
                category={campaign.category || ""}
                action="Pledge Now"
                goal={campaign.goalPledges}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
