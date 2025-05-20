import CampaignCard from "@/components/ui/campaign-card";
import { getCampaigns } from "@/lib/api";

export async function RecentActivity() {
  const campaigns = await getCampaigns();
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold ">Your activity</h1>
          <p className="text-sm text-gray-500">
            Here are the latest campaigns based on your pledge history.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                image={campaign.image}
                title={campaign.title}
                description={campaign.description}
                action="View campaign"
                link={campaign.link}
                // campaignType="your-activity"
                variant="horizontal"
                category={campaign.category}
                raised={campaign.raisedPledges}
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
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                image={campaign.image}
                title={campaign.title}
                description={campaign.description}
                link={campaign.link}
                variant="compact"
                category={campaign.category}
                action="Pledge Now"
                raised={campaign.raisedPledges}
                goal={campaign.goalPledges}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
