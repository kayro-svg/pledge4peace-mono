import CampaignCard from "@/components/ui/campaign-card";
import { getCampaigns } from "@/lib/api";
import { SanityCampaignsSection } from "@/lib/types";

export default async function RecentProjects({
  data,
}: {
  data: SanityCampaignsSection;
}) {
  // Get campaigns from the API
  const campaigns = await getCampaigns();

  const DEFAULT_SECTION_DATA = {
    campaignsHeading: "Recent Campaigns",
    campaignsDescription:
      "Here's how you can take action today, by voting and pledging in our recent campaigns.",
    campaigns: campaigns,
  };

  // Merge the provided data with default values, using nullish coalescing
  const sectionData = {
    campaignsHeading:
      data?.campaignsHeading ?? DEFAULT_SECTION_DATA.campaignsHeading,
    campaignsDescription:
      data?.campaignsDescription ?? DEFAULT_SECTION_DATA.campaignsDescription,
    campaigns: data?.campaigns ?? DEFAULT_SECTION_DATA.campaigns,
  };

  return (
    <section className="bg-[#fdfdf0] py-16 p-0 md:p-8 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[#2F4858] uppercase text-sm font-medium tracking-wider mb-4 border-b-2 w-fit mx-auto border-[#2F4858]">
            RECENT CAMPAIGNS
          </h2>
          <h1 className="text-[#2F4858] text-4xl md:text-5xl font-bold mb-4">
            {/* <span className="text-[#548281]">Take action</span> today */}
            {sectionData.campaignsHeading}
          </h1>
          <p className="section-subtitle text-[#2F4858] text-lg md:text-xl lg:text-xl">
            {/* Here's how you can take action today, by voting and pledging in our
            recent campaigns. */}
            {sectionData.campaignsDescription}
          </p>
        </div>

        {/* <div className="grid md:grid-cols-2 gap-8"> */}
        <div className="flex flex-row items-center justify-center gap-8">
          {sectionData.campaigns?.map((campaign) => {
            const onlyOneCampaign = sectionData.campaigns.length === 1;
            return (
              <CampaignCard
                key={campaign._id}
                campaignId={campaign._id}
                featuredImage={campaign.featuredImage?.asset?.url as string}
                title={campaign.title}
                description={campaign.description}
                link={campaign.slug.current}
                category={campaign.category || ""}
                action="Pledge Now"
                goal={campaign.goalPledges}
                variant={onlyOneCampaign ? "horizontal-large" : "default"}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
