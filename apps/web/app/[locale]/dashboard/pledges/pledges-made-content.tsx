"use client";

import { RecentActivity } from "@/components/dashboard/recent-activity";
import { SanityCampaign } from "@/lib/types";
import { useUserActivities } from "@/hooks/useUserInvolvement";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCampaigns } from "@/lib/sanity/queries";
import { logger } from "@/lib/utils/logger";
import { useLocale } from "next-intl";

export default function PledgesMadeContent() {
  const locale = useLocale() as "en" | "es";
  const { activities, isLoading } = useUserActivities(50); // Aumentamos el límite para asegurar obtener todas las actividades relevantes
  const [campaigns, setCampaigns] = useState<SanityCampaign[]>([]);

  // Memorizar la promesa de obtención de campañas
  const campaignsToFetch = useMemo(() => {
    return getCampaigns(50, locale);
  }, [locale]);

  // Filtrar solo actividades de tipo "pledge"
  const pledgeActivities = useMemo(() => {
    return activities.filter((activity) => activity.type === "pledge");
  }, [activities]);

  // Campañas donde el usuario ha hecho pledge
  const campaignsWithUserPledge = useMemo(() => {
    // Obtener IDs únicos de campañas con pledge
    const pledgedCampaignIds = new Set(
      pledgeActivities.map((activity) => activity.campaignId)
    );

    // Filtrar campañas que coinciden con esos IDs
    return campaigns.filter((campaign) => pledgedCampaignIds.has(campaign._id));
  }, [campaigns, pledgeActivities]);

  // Campañas donde el usuario NO ha hecho pledge
  const campaignsWithoutUserPledge = useMemo(() => {
    // Obtener IDs únicos de campañas con pledge
    const pledgedCampaignIds = new Set(
      pledgeActivities.map((activity) => activity.campaignId)
    );

    // Filtrar campañas que NO coinciden con esos IDs
    return campaigns.filter(
      (campaign) => !pledgedCampaignIds.has(campaign._id)
    );
  }, [campaigns, pledgeActivities]);

  // Logging para depuración
  useEffect(() => {
    if (campaigns.length > 0 && activities.length > 0) {
      logger.log("Total campaigns:", campaigns.length);
      logger.log("Total pledge activities:", pledgeActivities);
      logger.log("Campaigns with pledge:", campaignsWithUserPledge);
      logger.log(
        "Campaigns without pledge:",
        campaignsWithoutUserPledge.length
      );
    }
  }, [
    campaigns,
    activities,
    pledgeActivities,
    campaignsWithUserPledge,
    campaignsWithoutUserPledge,
  ]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const campaigns = await campaignsToFetch;
      setCampaigns(campaigns);
    };
    fetchCampaigns();
  }, [campaignsToFetch]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <RecentActivity
            campaignsPledged={campaignsWithUserPledge}
            campaignsNotPledged={campaignsWithoutUserPledge}
          />
        </div>
      </div>
    </div>
  );
}
