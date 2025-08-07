"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface TabHeaderProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabHeader({ activeTab, onTabChange }: TabHeaderProps) {
  const t = useTranslations("SingleCampaign_Page");
  const tabs = [
    { id: "solution-proposals", label: t("solution_proposals_tab_label") },
    // { id: "conference", label: "Upcoming conference" },
    { id: "ways-to-support", label: t("ways_to_support_tab_label") },
  ];

  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "px-6 py-4 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "border-b-2 border-[#548281] text-[#548281]"
              : "text-gray-600 hover:text-[#548281]"
          )}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
