import PledgesProgressBar from "@/components/ui/pledges-progress-bar";
import { SanityCampaign } from "@/lib/types";
import { PledgeForm } from "..";
import MediaGallery from "../gallery-image/media-gallery";

interface CampaignDetailContentProps {
  campaign: SanityCampaign;
}

export default function MainContentSection({
  campaign,
}: CampaignDetailContentProps) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-3xl shadow-[0_0_10px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="p-8 flex flex-row gap-8">
          {campaign.gallery && (
            <MediaGallery
              media={campaign.gallery}
              overlayTitle={campaign.title}
              overlaySubtitle={campaign.description}
            />
          )}

          <div className="w-4/6 flex flex-col gap-4 justify-between">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500">pledge4peace.org</div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {campaign.title}
              </h1>
            </div>

            <div>
              <p className="text-gray-700">{campaign.description}</p>
            </div>
            <PledgesProgressBar
              currentValue={100}
              goalValue={campaign.goalPledges}
            />
            <PledgeForm commitmentText={campaign.commitmentText || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
