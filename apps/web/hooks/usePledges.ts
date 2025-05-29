import { useState, useEffect, useCallback } from 'react';
import { getCampaignPledgeCount } from '@/lib/api/pledges';

/**
 * Custom hook to manage pledge counts for a campaign
 * @param campaignId The ID of the campaign
 * @param initialCount Optional initial count to use before API data is loaded
 * @returns Object containing pledge count state and functions to manage it
 */
export function usePledges(campaignId: string | undefined, initialCount: number = 0) {
  const [pledgeCount, setPledgeCount] = useState<number>(initialCount);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch the pledge count from the API
  const fetchPledgeCount = useCallback(async () => {
    if (!campaignId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const count = await getCampaignPledgeCount(campaignId);
      setPledgeCount(count);
      setError(null);
    } catch (err) {
      console.error('Error fetching pledge count:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pledge count'));
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  // Update the pledge count
  const updatePledgeCount = useCallback((newCount: number) => {
    setPledgeCount(newCount);
  }, []);

  // Fetch pledge count on mount and when campaignId changes
  useEffect(() => {
    fetchPledgeCount();
  }, [fetchPledgeCount]);

  return {
    pledgeCount,
    isLoading,
    error,
    updatePledgeCount,
    refreshPledgeCount: fetchPledgeCount
  };
}
