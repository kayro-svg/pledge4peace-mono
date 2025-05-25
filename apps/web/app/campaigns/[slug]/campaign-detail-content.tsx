"use client";

import MainContentSection from "@/components/campaign/campaign-main-content/campaign-main-content";
import ContentTabs from "@/components/campaign/content-tabs/content-tabs";
import { InteractionProvider } from "@/components/campaign/shared/interaction-context";
import {
  SanityCampaign,
  SanitySolutionsSection,
  SanityWaysToSupportTab,
} from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CampaignDetailContentProps {
  campaign: SanityCampaign;
}

export function CampaignDetailContent({
  campaign,
}: CampaignDetailContentProps) {
  return (
    <main className="min-h-screen bg-[#fffef5]">
      <div className="container mx-auto px-4 py-8">
        <div className="w-full mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-brand-500 hover:underline flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="flex flex-col gap-8">
            <MainContentSection campaign={campaign} />
            <InteractionProvider>
              <ContentTabs
                mainContentWidth="70%"
                sidebarWidth="30%"
                solutionsSection={
                  campaign?.solutionsSection as SanitySolutionsSection
                }
                waysToSupportTabs={
                  campaign?.waysToSupportTabs as SanityWaysToSupportTab[]
                }
              />
            </InteractionProvider>
          </div>
        </div>
      </div>
    </main>
  );
}
