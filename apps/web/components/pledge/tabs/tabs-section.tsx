"use client";

import { useEffect, useState } from "react";
import ConferenceTab from "../conference/conference-tab";
import PeaceAgreementContent from "../peace-agreement/peace-agreement-content";
import TabHeader from "./tab-header";

interface TabsSectionProps {
  campaignSlug: string;
  onSolutionChange?: (solutionId: string) => void;
}

export default function TabsSection({
  campaignSlug,
  onSolutionChange,
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
      <div className="p-6 overflow-y-auto flex-1">
        {activeTab === "solution-proposals" && (
          <PeaceAgreementContent
            campaignSlug={campaignSlug}
            onSolutionChange={handleSolutionChange}
            activeSolutionId={activeSolutionId}
          />
        )}
        {activeTab === "conference" && (
          <ConferenceTab campaignSlug={campaignSlug} />
        )}
      </div>
    </div>
  );
}
