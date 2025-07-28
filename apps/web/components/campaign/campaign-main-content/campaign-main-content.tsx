"use client";

import DonationModal from "@/components/donations/DonationModal";
import PledgesProgressBar from "@/components/ui/pledges-progress-bar";
import { usePledges } from "@/hooks/usePledges";
import { SanityCampaign } from "@/lib/types";
import { useState } from "react";
import { PledgeForm } from "..";
import MediaGallery from "../gallery-image/media-gallery";

interface CampaignDetailContentProps {
  campaign: SanityCampaign;
}

export default function MainContentSection({
  campaign,
}: CampaignDetailContentProps) {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  // Get the campaign ID (use _id as fallback)
  const campaignId = campaign._id;

  // Use our custom hook to manage pledge counts
  const { pledgeCount, updatePledgeCount } = usePledges(campaignId, 0); // Start with 0 as default

  // Handle when a new pledge is created
  const handlePledgeCreated = (newCount: number) => {
    updatePledgeCount(newCount);
  };

  // Open donation modal after user accepts invitation
  const handleDonateIntent = () => {
    setIsDonationModalOpen(true);
  };

  // Determine the current value to display
  const displayValue = pledgeCount;

  return (
    <>
      <div className="w-full">
        <div className="bg-white rounded-3xl shadow-[0_0_10px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-2 md:p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
            {campaign.gallery && (
              <MediaGallery
                media={campaign.gallery}
                overlayTitle={campaign.title}
                overlaySubtitle={campaign.description}
              />
            )}

            <div className="w-full lg:w-4/6 gap-8 md:gap-0 flex flex-col justify-between p-2 lg:p-0">
              <div className="flex flex-col gap-4">
                <div className="text-sm text-gray-500">pledge4peace.org</div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {campaign.title}
                </h1>
                <p className="text-gray-700 mt-4">{campaign.description}</p>
              </div>
              <PledgesProgressBar
                currentValue={displayValue}
                goalValue={campaign.goalPledges}
              />
              <PledgeForm
                pledgeCommitmentItems={campaign.pledgeCommitmentItems || []}
                campaignId={campaignId || ""}
                campaignTitle={campaign.title || ""}
                onPledgeCreated={handlePledgeCreated}
                onDonateIntent={handleDonateIntent}
              />
            </div>
          </div>
        </div>
      </div>
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </>
  );
}
