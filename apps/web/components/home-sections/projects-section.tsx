"use client";
import CampaignCard from "@/components/ui/campaign-card";
import { Campaign, SanityCampaignsSection } from "@/lib/types";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, Grid3X3 } from "lucide-react";
import { useLocaleContent } from "@/hooks/use-locale-content";

export default function RecentProjects({
  data,
  campaigns,
}: {
  data: SanityCampaignsSection;
  campaigns: Campaign[];
}) {
  const router = useRouter();
  const { getString } = useLocaleContent();

  const DEFAULT_SECTION_DATA = {
    campaignsHeading: "Recent Campaigns",
    campaignsDescription:
      "Here's how you can take action today, by voting and pledging in our recent campaigns.",
    campaigns: campaigns,
  };

  console.log("data campaigns", data?.campaigns);

  // Merge the provided data with default values, using nullish coalescing
  const sectionData = {
    campaignsHeading:
      data?.campaignsHeading ?? DEFAULT_SECTION_DATA.campaignsHeading,
    campaignsDescription:
      data?.campaignsDescription ?? DEFAULT_SECTION_DATA.campaignsDescription,
    campaigns: data?.campaigns ?? DEFAULT_SECTION_DATA.campaigns,
  };

  const moreThanOneCampaign = sectionData.campaigns.length > 1;

  return (
    <section
      className="bg-[#fdfdf0] py-16 p-0 md:p-8 px-4 sm:px-6 md:px-8 lg:px-12"
      id="projects-section"
    >
      <div className="w-full">
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
        <div
          className={`lg:container mx-auto items-center justify-center gap-8 ${
            moreThanOneCampaign
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 "
              : "flex flex-row lg:flex-col justify-center"
          }`}
        >
          {sectionData.campaigns?.map((campaign) => {
            return (
              <CampaignCard
                key={campaign._id}
                campaignId={campaign._id}
                featuredImage={campaign.featuredImage?.asset?.url as string}
                title={getString(campaign.title)}
                description={getString(campaign.description)}
                link={campaign.slug.current}
                category={campaign.category || ""}
                action="Pledge Now"
                goal={campaign.goalPledges}
                variant={moreThanOneCampaign ? "default" : "horizontal-large"}
              />
            );
          })}
        </div>
        <div className="relative mt-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center items-center">
            <div className="bg-[#fdfdf0] px-8">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Eye className="h-4 w-4" />
                <span>Want to see more campaigns?</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 group">
          <Button
            size="lg"
            className="text-white border-0 rounded-full px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push("/campaigns")}
          >
            <Grid3X3 className="mr-3 h-5 w-5" />
            View All Campaigns
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-all duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
}
