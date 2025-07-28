"use client";

import { useEffect, useMemo } from "react";
import { ChartAreaInteractive } from "./chart-area-interactive";
import { ImpactStories } from "./impact-stories";
import { SectionCards } from "./section-cards";
import SupportBanner from "./support-banner";
import { useUserStats } from "@/hooks/useUserInvolvement";
import { useUserActivities } from "@/hooks/useUserInvolvement";

export function DashboardHomeContent() {
  const {
    stats,
    isStatsLoading: isLoading,
    statsError: error,
  } = useUserStats();

  const {
    activities,
    isActivitiesLoading,
    activitiesError,
    refetchAll,
    refetchActivities,
  } = useUserActivities(100);
  // Fetch user activities with a reasonable limit
  const campaignsSupportedQty = useMemo(
    () => activities.filter((activity) => activity.type === "pledge").length,
    [activities]
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        {/* <div className="p-4 lg:px-6">
          <div className="flex flex-col gap-4">
            <SupportBanner />
          </div>
        </div> */}
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards
            stats={stats}
            campaignsSupportedQty={campaignsSupportedQty}
            isLoading={isLoading}
            error={error}
          />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <div className="px-4 lg:px-6">
            <ImpactStories />
          </div>
        </div>
      </div>
    </div>
  );
}
