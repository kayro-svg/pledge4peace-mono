import { useState } from "react";
import TabsSection from "../tabs/tabs-section";
import SidebarSection from "../sidebar/sidebar-section";
import { SanityWaysToSupportTab, SanitySolutionsSection } from "@/lib/types";

interface ContentTabsProps {
  mainContentWidth: string;
  sidebarWidth: string;
  solutionsSection: SanitySolutionsSection;
  waysToSupportTabs: SanityWaysToSupportTab[];
  campaignId: string;
}

export default function ContentTabs({
  mainContentWidth,
  sidebarWidth,
  solutionsSection,
  waysToSupportTabs,
  campaignId,
}: ContentTabsProps) {
  const [activeSolutionId, setActiveSolutionId] = useState("");

  const handleSolutionChange = (solutionId: string) => {
    setActiveSolutionId(solutionId);
  };

  return (
    <div className="flex flex-row gap-8" data-tab-value="comments">
      <div className="flex flex-col" style={{ width: mainContentWidth }}>
        <TabsSection
          solutionsSection={solutionsSection}
          waysToSupportTabs={waysToSupportTabs}
          onSolutionChange={handleSolutionChange}
          campaignId={campaignId}
        />
      </div>
      <div className="flex flex-col" style={{ width: sidebarWidth }}>
        <div className="sticky top-20">
          <SidebarSection solutionId={activeSolutionId} />
        </div>
      </div>
    </div>
  );
}
