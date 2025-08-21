"use client";

import {
  SanitySolutionsSection,
  SanityWaysToSupportTab,
  SanityParty,
} from "@/lib/types";
import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { useSearchParams } from "next/navigation";
import PeaceAgreementContent from "../peace-agreement/peace-agreement-content";
import WaysToSupport from "../ways-to-support/ways-to-support";
import TabHeader from "./tab-header";

export interface TabsSectionRef {
  navigateToSolutions: () => void;
}

interface TabsSectionProps {
  solutionsSection: SanitySolutionsSection;
  waysToSupportTabs: SanityWaysToSupportTab[];
  onSolutionChange?: (solutionId: string) => void;
  onCommentClick?: (solutionId: string | React.MouseEvent) => void;
  campaignId: string;
  campaignSlug?: string;
  campaignTitle?: string;
  activeSolutionId?: string; // allow parent to control initial/target solution
  parties: SanityParty[]; // Nuevo: partidos dinámicos
}

const TabsSection = forwardRef<TabsSectionRef, TabsSectionProps>(
  (
    {
      solutionsSection,
      waysToSupportTabs,
      onSolutionChange,
      onCommentClick,
      campaignId,
      campaignSlug,
      campaignTitle,
      activeSolutionId: externalActiveSolutionId,
      parties,
    },
    ref
  ) => {
    const [activeTab, setActiveTab] = useState("solution-proposals");
    const [activeSolutionId, setActiveSolutionId] = useState("");
    const searchParams = useSearchParams();

    // When active solution changes, notify parent component
    useEffect(() => {
      if (onSolutionChange) {
        onSolutionChange(activeSolutionId);
      }
    }, [activeSolutionId, onSolutionChange]);

    const handleSolutionChange = (solutionId: string) => {
      setActiveSolutionId(solutionId);
    };

    // Sync internal activeSolutionId with external prop (from deep links)
    useEffect(() => {
      if (
        externalActiveSolutionId &&
        externalActiveSolutionId !== activeSolutionId
      ) {
        setActiveSolutionId(externalActiveSolutionId);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [externalActiveSolutionId]);

    // Function to navigate to solutions tab (exposed for external use)
    const navigateToSolutions = () => {
      setActiveTab("solution-proposals");
      // Scroll to the solutions section with a smooth animation
      setTimeout(() => {
        // First, try to find the specific solutions section
        let solutionsElement = document.getElementById("solutions-section");

        // If not found, fallback to the tab container
        if (!solutionsElement) {
          solutionsElement = document.querySelector(
            '[data-tab-value="comments"]'
          );
        }

        if (solutionsElement) {
          // Get the element's position and add some offset for better visibility
          const elementRect = solutionsElement.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const offsetPosition = absoluteElementTop - 100; // 100px offset from top

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          // Add a section highlight ONLY when there is no deep-link to a specific item
          const hasDeepLink = Boolean(
            searchParams.get("solutionId") || searchParams.get("commentId")
          );
          if (!hasDeepLink) {
            solutionsElement.classList.add("highlight-solutions");
            setTimeout(() => {
              solutionsElement.classList.remove("highlight-solutions");
            }, 1500);
          }

          // If there is a target solution deep-link, try to scroll directly to it
          const targetSolutionId = searchParams.get("solutionId");
          if (targetSolutionId) {
            // Give a moment for the list to render
            const tryScrollToSolution = () => {
              const selector = `[data-solution-id="${targetSolutionId}"] .solution-card, [data-solution-id="${targetSolutionId}"]`;
              const node = document.querySelector(
                selector
              ) as HTMLElement | null;
              if (node) {
                const headerOffset = 100;
                const elementPosition =
                  node.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                node.classList.add("ring-2", "ring-[#2F4858]/20");
                setTimeout(() => {
                  node.classList.remove("ring-2", "ring-[#2F4858]/20");
                }, 1200);
                return true;
              }
              return false;
            };

            let attempts = 0;
            const iv = setInterval(() => {
              attempts++;
              if (tryScrollToSolution() || attempts > 15) {
                clearInterval(iv);
              }
            }, 150);
          }
        }
      }, 200); // Increased timeout to ensure tab content is rendered
    };

    // Expose the navigateToSolutions function via ref
    useImperativeHandle(
      ref,
      () => ({
        navigateToSolutions,
      }),
      []
    );

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
              campaignSlug={campaignSlug}
              campaignTitle={campaignTitle}
              parties={parties}
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
);

TabsSection.displayName = "TabsSection";

export default TabsSection;
