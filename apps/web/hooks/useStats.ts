import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/config";

interface StatsData {
  peaceActivists: number;
  pledgesMade: number;
}

export function useStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.homeStats.getStats);
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error || "Failed to load statistics");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load statistics"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const intervalId = setInterval(fetchStats, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return { stats, isLoading, error };
}
