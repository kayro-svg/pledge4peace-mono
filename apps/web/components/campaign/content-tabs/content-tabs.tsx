import TabsSection, { TabsSectionRef } from "../tabs/tabs-section";
import SidebarSection from "../sidebar/sidebar-section";
import {
  SanityWaysToSupportTab,
  SanitySolutionsSection,
  SanityParty,
} from "@/lib/types";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface ContentTabsRef {
  navigateToSolutions: () => void;
}

interface ContentTabsProps {
  mainContentWidth?: string;
  sidebarWidth: string;
  solutionsSection: SanitySolutionsSection;
  waysToSupportTabs: SanityWaysToSupportTab[];
  campaignId: string;
  activeSolutionId: string;
  onSolutionChange: (solutionId: string) => void;
  onCommentClick?: (solutionId: string | React.MouseEvent) => void;
  campaignSlug?: string;
  campaignTitle?: string;
  parties: SanityParty[]; // Nuevo: partidos dinámicos
}

const ContentTabs = forwardRef<ContentTabsRef, ContentTabsProps>(
  (
    {
      solutionsSection,
      waysToSupportTabs,
      campaignId,
      activeSolutionId,
      onSolutionChange,
      onCommentClick,
      campaignSlug,
      campaignTitle,
      parties,
    },
    ref
  ) => {
    const tabsSectionRef = useRef<TabsSectionRef>(null);

    const handleSolutionClick = (solutionId: string) => {
      onSolutionChange(solutionId);
    };

    // Expose the navigateToSolutions function via ref
    useImperativeHandle(
      ref,
      () => ({
        navigateToSolutions: () => {
          tabsSectionRef.current?.navigateToSolutions();
        },
      }),
      []
    );

    return (
      <div className="flex flex-row gap-8" data-tab-value="comments">
        <div className="flex flex-col w-full lg:w-[70%]">
          <TabsSection
            ref={tabsSectionRef}
            solutionsSection={solutionsSection}
            waysToSupportTabs={waysToSupportTabs}
            onSolutionChange={handleSolutionClick}
            campaignId={campaignId}
            onCommentClick={onCommentClick}
            campaignSlug={campaignSlug}
            campaignTitle={campaignTitle}
            activeSolutionId={activeSolutionId}
            parties={parties}
          />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col lg:w-[30%]">
          <div className="sticky top-20">
            <SidebarSection solutionId={activeSolutionId} />
          </div>
        </div>
      </div>
    );
  }
);

ContentTabs.displayName = "ContentTabs";

export default ContentTabs;
