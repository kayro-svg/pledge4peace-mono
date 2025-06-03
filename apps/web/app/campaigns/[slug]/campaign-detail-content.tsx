"use client";

import { useState } from "react";
import MainContentSection from "@/components/campaign/campaign-main-content/campaign-main-content";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SidebarSection from "@/components/campaign/sidebar/sidebar-section";
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
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeSolutionId, setActiveSolutionId] = useState("");

  const handleCommentClick = (solutionId: string | React.MouseEvent) => {
    // Extract solutionId if it's an event (from mobile view) or use it directly (from desktop view)
    const id = typeof solutionId === "string" ? solutionId : activeSolutionId;
    if (id) {
      setActiveSolutionId(id);
      // For mobile and tablet, open comments in a dialog
      // For desktop, we'll handle comments differently (inline or in sidebar)
      if (window.innerWidth < 1024) {
        setIsCommentsOpen(true);
      }
    }
  };

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
            <InteractionProvider initialStats={undefined}>
              <ContentTabs
                sidebarWidth="30%"
                solutionsSection={
                  campaign?.solutionsSection as SanitySolutionsSection
                }
                waysToSupportTabs={
                  campaign?.waysToSupportTabs as SanityWaysToSupportTab[]
                }
                campaignId={campaign?._id}
                activeSolutionId={activeSolutionId}
                onSolutionChange={setActiveSolutionId}
                onCommentClick={handleCommentClick}
              />

              {/* Mobile Comments Modal - Only visible on mobile/tablet */}
              <div className="lg:hidden">
                <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
                  <DialogContent className="lg:hidden md:max-w-[500px] h-[80vh] max-h-[80vh] p-0 overflow-hidden flex flex-col gap-0">
                    <DialogHeader className="p-4 h-fit w-full justify-center items-center flex">
                      <DialogTitle>Comments</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto">
                      {activeSolutionId ? (
                        <div className="p-2 h-full">
                          <SidebarSection solutionId={activeSolutionId} />
                        </div>
                      ) : (
                        <div className="p-6 text-center h-full flex items-center justify-center">
                          <p>Select a solution to view comments</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </InteractionProvider>
          </div>
        </div>
      </div>
    </main>
  );
}
