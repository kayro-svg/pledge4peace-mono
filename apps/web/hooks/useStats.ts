import { useEffect, useState, useCallback } from "react";
import { API_ENDPOINTS } from "@/lib/config";

interface StatsData {
  peaceActivists: number;
  pledgesMade: number;
}

// Default mock data to use when API fails
const DEFAULT_MOCK_STATS: StatsData = {
  peaceActivists: 15243,
  pledgesMade: 8759,
};

export function useStats() {
  const [stats, setStats] = useState<StatsData>(DEFAULT_MOCK_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      console.log("[Stats] Fetching home page statistics");
      setIsLoading(true);

      // Use AbortSignal to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(API_ENDPOINTS.homeStats.getStats, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(
          `[Stats] API responded with error: ${response.status} ${response.statusText}`
        );
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      if (data.success) {
        console.log("[Stats] Successfully fetched statistics:", data.data);
        setStats(data.data);
        setError(null);
      } else {
        console.warn("[Stats] API returned success: false", data.error);
        throw new Error(data.error || "Failed to load statistics");
      }
    } catch (err) {
      console.error("[Stats] Error fetching stats:", err);
      // Don't update error state if we're using fallback data
      if (!stats || stats === DEFAULT_MOCK_STATS) {
        setError(
          err instanceof Error ? err.message : "Failed to load statistics"
        );
      }
      // Keep the existing stats if we already have some
      if (!stats) {
        setStats(DEFAULT_MOCK_STATS);
      }
    } finally {
      setIsLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Refresh stats every 5 minutes
    const intervalId = setInterval(fetchStats, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    stats,
    isLoading,
    error,
    refreshStats: fetchStats,
  };
}
