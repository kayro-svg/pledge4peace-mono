import TabsSection from "../tabs/tabs-section";
import SidebarSection from "../sidebar/sidebar-section";
import { SanityWaysToSupportTab, SanitySolutionsSection } from "@/lib/types";

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
}

export default function ContentTabs({
  solutionsSection,
  waysToSupportTabs,
  campaignId,
  activeSolutionId,
  onSolutionChange,
  onCommentClick,
  campaignSlug,
  campaignTitle,
}: ContentTabsProps) {
  const handleSolutionClick = (solutionId: string) => {
    onSolutionChange(solutionId);
  };

  // const handleCommentButtonClick = (
  //   e: React.MouseEvent,
  //   solutionId: string
  // ) => {
  //   e.stopPropagation();
  //   if (onCommentClick) {
  //     onCommentClick(solutionId);
  //   }
  // };

  return (
    <div className="flex flex-row gap-8" data-tab-value="comments">
      <div className="flex flex-col w-full lg:w-[70%]">
        <TabsSection
          solutionsSection={solutionsSection}
          waysToSupportTabs={waysToSupportTabs}
          onSolutionChange={handleSolutionClick}
          campaignId={campaignId}
          onCommentClick={onCommentClick}
          campaignSlug={campaignSlug}
          campaignTitle={campaignTitle}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col lg:w-[30%]">
        <div className="sticky top-20">
          <SidebarSection solutionId={activeSolutionId} />
        </div>
      </div>

      {/* Mobile Comment Button - Only show when a solution is selected */}
      {/* {activeSolutionId && (
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
          <Button 
            size="lg" 
            className="rounded-full w-14 h-14 p-0 shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
            aria-label="View comments"
            onClick={(e) => handleCommentButtonClick(e, activeSolutionId)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )} */}
    </div>
  );
}
