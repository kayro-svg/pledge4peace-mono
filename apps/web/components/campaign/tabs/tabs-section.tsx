"use client";

import { useEffect, useState } from "react";
import ConferenceTab from "../conference/conference-tab";
import PeaceAgreementContent from "../peace-agreement/peace-agreement-content";
import TabHeader from "./tab-header";
import WaysToSupport from "../ways-to-support/ways-to-support";
import { SanitySolutionsSection, SanityWaysToSupportTab } from "@/lib/types";

interface TabsSectionProps {
  solutionsSection: SanitySolutionsSection;
  waysToSupportTabs: SanityWaysToSupportTab[];
  onSolutionChange?: (solutionId: string) => void;
  campaignId: string;
}

export default function TabsSection({
  solutionsSection,
  waysToSupportTabs,
  onSolutionChange,
  campaignId,
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
      <div className="p-6 overflow-y-auto flex-1 h-full">
        {activeTab === "solution-proposals" && (
          <PeaceAgreementContent
            solutionsSection={solutionsSection}
            onSolutionChange={handleSolutionChange}
            activeSolutionId={activeSolutionId}
            campaignId={campaignId}
          />
        )}
        {activeTab === "ways-to-support" && (
          <WaysToSupport
            // mainTab="ways-to-support"
            // campaignSlug={campaignSlug}
            waysToSupportTabs={waysToSupportTabs}
          />
        )}
      </div>
    </div>
  );
}
