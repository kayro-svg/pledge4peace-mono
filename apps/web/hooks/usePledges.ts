import { useState, useEffect, useCallback } from "react";
import { getCampaignPledgeCount } from "@/lib/api/pledges";
import { logger } from "@/lib/utils/logger";

/**
 * Custom hook to manage pledge counts for a campaign
 * @param campaignId The ID of the campaign
 * @param initialCount Optional initial count to use before API data is loaded
 * @returns Object containing pledge count state and functions to manage it
 */
export function usePledges(
  campaignId: string | undefined,
  initialCount: number = 0
) {
  // Use the initial count as a starting point
  const [pledgeCount, setPledgeCount] = useState<number>(initialCount);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Fetch the pledge count from the API with debouncing to prevent excessive calls
  const fetchPledgeCount = useCallback(async () => {
    if (!campaignId) {
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    // Debounce API calls - don't refetch if last fetch was less than 5 seconds ago
    // unless this is the first fetch (lastFetchTime === 0)
    if (lastFetchTime > 0 && now - lastFetchTime < 5000) {
      logger.log(`[Pledges] Skipping fetch for ${campaignId} - throttled`);
      return;
    }

    try {
      logger.log(`[Pledges] Fetching pledge count for campaign: ${campaignId}`);
      setIsLoading(true);
      setLastFetchTime(now);

      const count = await getCampaignPledgeCount(campaignId);
      logger.log(`[Pledges] Retrieved count for ${campaignId}: ${count}`);

      // Only update if we got a valid number
      if (typeof count === "number" && !isNaN(count)) {
        setPledgeCount(count);
        setError(null);
      }
    } catch (err) {
      logger.error("[Pledges] Error fetching pledge count:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch pledge count")
      );
      // We don't reset the pledge count on error to avoid UI flickering
      // The mock data implementation should prevent this error from happening
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, lastFetchTime]);

  // Update the pledge count locally (e.g., after a user makes a pledge)
  const updatePledgeCount = useCallback(
    (newCount: number) => {
      logger.log(
        `[Pledges] Manually updating count for ${campaignId} to ${newCount}`
      );
      setPledgeCount(newCount);
    },
    [campaignId]
  );

  // Increment the pledge count by 1 (useful after the user makes a pledge)
  const incrementPledgeCount = useCallback(() => {
    setPledgeCount((current) => {
      const newValue = current + 1;
      logger.log(
        `[Pledges] Incrementing count for ${campaignId} from ${current} to ${newValue}`
      );
      return newValue;
    });
  }, [campaignId]);

  // Fetch pledge count on mount and when campaignId changes
  useEffect(() => {
    if (campaignId) {
      logger.log(`[Pledges] Initial fetch for campaign: ${campaignId}`);
      fetchPledgeCount();
    }
  }, [campaignId, fetchPledgeCount]);

  return {
    pledgeCount,
    isLoading,
    error,
    updatePledgeCount,
    incrementPledgeCount,
    refreshPledgeCount: fetchPledgeCount,
  };
}
