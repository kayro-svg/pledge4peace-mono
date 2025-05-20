import CampaignCard from "@/components/ui/campaign-card";
import { getCampaigns } from "@/lib/api";

export default async function RecentProjects() {
  // Get campaigns from the API
  const campaigns = await getCampaigns();
  console.log(campaigns);

  return (
    <div className="bg-[#fdfdf0] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[#2F4858] uppercase text-sm font-medium tracking-wider mb-4 border-b-2 w-fit mx-auto border-[#2F4858]">
            RECENT CAMPAIGNS
          </h2>
          <h1 className="text-[#2F4858] text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#548281]">Take action</span> today
          </h1>
          <p className="text-[#2F4858] text-lg max-w-3xl mx-auto">
            Here's how you can take action today, by voting and pledging in our
            recent campaigns.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {campaigns.map((campaign, index) => (
            <CampaignCard
              key={index}
              image={campaign.image}
              title={campaign.title}
              description={campaign.description}
              link={campaign.link}
              category={campaign.category}
              action="Pledge Now"
              raised={campaign.raisedPledges}
              goal={campaign.goalPledges}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
