"use client";

import { SanitySolutionsSection, SanityWaysToSupportTab } from "@/lib/types";
import { useEffect, useState } from "react";
import PeaceAgreementContent from "../peace-agreement/peace-agreement-content";
import WaysToSupport from "../ways-to-support/ways-to-support";
import TabHeader from "./tab-header";

interface TabsSectionProps {
  solutionsSection: SanitySolutionsSection;
  waysToSupportTabs: SanityWaysToSupportTab[];
  onSolutionChange?: (solutionId: string) => void;
  onCommentClick?: (solutionId: string | React.MouseEvent) => void;
  campaignId: string;
  campaignSlug?: string;
  campaignTitle?: string;
}

export default function TabsSection({
  solutionsSection,
  waysToSupportTabs,
  onSolutionChange,
  onCommentClick,
  campaignId,
  campaignSlug,
  campaignTitle,
}: TabsSectionProps) {
  const [activeTab, setActiveTab] = useState("solution-proposals");
  const [activeSolutionId, setActiveSolutionId] = useState("");

  // When active solution changes, notify parent component
  useEffect(() => {
    if (onSolutionChange) {
      onSolutionChange(activeSolutionId);
    }
  }, [activeSolutionId, onSolutionChange]);

  const handleSolutionChange = (solutionId: string) => {
    setActiveSolutionId(solutionId);
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_0_10px_rgba(0,0,0,0.1)] w-full h-full flex flex-col">
      <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="p-4 md:p-6 overflow-y-auto flex-1 h-full">
        {activeTab === "solution-proposals" && (
          <PeaceAgreementContent
            solutionsSection={solutionsSection}
            onSolutionChange={handleSolutionChange}
            onCommentClick={onCommentClick}
            activeSolutionId={activeSolutionId}
            campaignId={campaignId}
          />
        )}
        {activeTab === "ways-to-support" && (
          <WaysToSupport
            waysToSupportTabs={waysToSupportTabs}
            campaignSlug={campaignSlug}
            campaignTitle={campaignTitle}
          />
        )}
      </div>
    </div>
  );
}
