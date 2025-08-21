import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  getDashboard,
  getStats,
  getActivity,
  getComments,
  UserStats,
  UserInvolvementData,
  RecentActivity,
  RecentComment,
} from "@/lib/api/user-involvement";

interface UseUserInvolvementOptions {
  fetchDashboard?: boolean;
  fetchStats?: boolean;
  fetchActivity?: boolean;
  fetchComments?: boolean;
  activityLimit?: number;
  commentsLimit?: number;
  campaignTitles?: Record<string, { title: string; category: string }>;
}

interface UseUserInvolvementReturn {
  // Data
  dashboardData: UserInvolvementData | null;
  stats: UserStats | null;
  activities: RecentActivity[];
  comments: RecentComment[];

  // Loading states
  isLoading: boolean;
  isDashboardLoading: boolean;
  isStatsLoading: boolean;
  isActivitiesLoading: boolean;
  isCommentsLoading: boolean;

  // Error states
  error: string | null;
  dashboardError: string | null;
  statsError: string | null;
  activitiesError: string | null;
  commentsError: string | null;

  // Actions
  refetchDashboard: () => Promise<void>;
  refetchStats: () => Promise<void>;
  refetchActivities: () => Promise<void>;
  refetchComments: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

export function useUserInvolvement(
  options: UseUserInvolvementOptions = {}
): UseUserInvolvementReturn {
  const {
    fetchDashboard = false,
    fetchStats = false,
    fetchActivity = false,
    fetchComments = false,
    activityLimit = 50,
    commentsLimit = 50,
    campaignTitles,
  } = options;

  // Data states
  const [dashboardData, setDashboardData] =
    useState<UserInvolvementData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [comments, setComments] = useState<RecentComment[]>([]);
  // Loading states
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  // Error states
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // Computed loading and error states
  const isLoading =
    isDashboardLoading ||
    isStatsLoading ||
    isActivitiesLoading ||
    isCommentsLoading;
  const error =
    dashboardError || statsError || activitiesError || commentsError;

  // Fetch functions
  const refetchDashboard = useCallback(async () => {
    if (!fetchDashboard) return;

    try {
      setIsDashboardLoading(true);
      setDashboardError(null);
      const data = await getDashboard(campaignTitles);
      setDashboardData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      setDashboardError(errorMessage);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsDashboardLoading(false);
    }
  }, [fetchDashboard, campaignTitles]);

  const refetchStats = useCallback(async () => {
    if (!fetchStats) return;

    try {
      setIsStatsLoading(true);
      setStatsError(null);
      const data = await getStats();
      setStats(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch stats";
      setStatsError(errorMessage);
      console.error("Error fetching stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [fetchStats]);

  const refetchActivities = useCallback(async () => {
    if (!fetchActivity) return;

    try {
      setIsActivitiesLoading(true);
      setActivitiesError(null);
      const data = await getActivity(activityLimit);
      setActivities(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch activities";
      setActivitiesError(errorMessage);
      console.error("Error fetching activities:", err);
    } finally {
      setIsActivitiesLoading(false);
    }
  }, [fetchActivity, activityLimit]);

  const refetchComments = useCallback(async () => {
    if (!fetchComments) return;

    try {
      setIsCommentsLoading(true);
      setCommentsError(null);
      const data = await getComments(commentsLimit);
      setComments(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch comments";
      setCommentsError(errorMessage);
      console.error("Error fetching comments:", err);
    } finally {
      setIsCommentsLoading(false);
    }
  }, [fetchComments, commentsLimit]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchDashboard(),
      refetchStats(),
      refetchActivities(),
      refetchComments(),
    ]);
  }, [refetchDashboard, refetchStats, refetchActivities, refetchComments]);

  // Initial fetch
  useEffect(() => {
    if (fetchDashboard) {
      refetchDashboard();
    }
  }, [refetchDashboard, fetchDashboard]);

  useEffect(() => {
    if (fetchStats) {
      refetchStats();
    }
  }, [refetchStats, fetchStats]);

  useEffect(() => {
    if (fetchActivity) {
      refetchActivities();
    }
  }, [refetchActivities, fetchActivity]);

  useEffect(() => {
    if (fetchComments) {
      refetchComments();
    }
  }, [refetchComments, fetchComments]);

  return {
    // Data
    dashboardData,
    stats,
    activities,
    comments,
    // Loading states
    isLoading,
    isDashboardLoading,
    isStatsLoading,
    isActivitiesLoading,
    isCommentsLoading,

    // Error states
    error,
    dashboardError,
    statsError,
    activitiesError,
    commentsError,

    // Actions
    refetchDashboard,
    refetchStats,
    refetchActivities,
    refetchComments,
    refetchAll,
  };
}

// Helper hook specifically for stats only
export function useUserStats() {
  return useUserInvolvement({ fetchStats: true });
}

// Helper hook specifically for user profile dashboard
export function useUserProfileDashboard(
  campaignTitles?: Record<string, { title: string; category: string }>
) {
  return useUserInvolvement({
    fetchDashboard: true,
    campaignTitles,
  });
}

// Cache para los datos de campañas (por locale)
type CampaignDashboardData = { title: string; id: string; slug: string };
const campaignsCache: Record<
  string,
  { data: CampaignDashboardData; timestamp: number }
> = {};
const CAMPAIGNS_CACHE_TTL = 30 * 60 * 1000; // 30 minutos de vida para el caché

// Función para limpiar la caché de campañas
export function invalidateCampaignsCache(): void {
  Object.keys(campaignsCache).forEach((key) => {
    delete campaignsCache[key];
  });
  console.log("[Cache] Invalidated campaigns cache");
}

// Función de utilidad para obtener detalles de campaña con caché
const useCampaignDetailsLoader = (items: { campaignId: string }[]) => {
  const locale = useLocale() as "en" | "es";
  const [campaignDetails, setCampaignDetails] = useState<
    Record<string, { title: string; id: string; slug: string }>
  >({});
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  const buildCacheKey = useCallback(
    (campaignId: string) => `${campaignId}:${locale}`,
    [locale]
  );

  // Función para obtener detalles de campaña con caché
  const getCampaignDetails = useCallback(
    async (campaignId: string) => {
      try {
        const cacheKey = buildCacheKey(campaignId);
        // Verificar si existe en caché y no ha expirado
        if (
          campaignsCache[cacheKey] &&
          Date.now() - campaignsCache[cacheKey].timestamp < CAMPAIGNS_CACHE_TTL
        ) {
          return campaignsCache[cacheKey].data;
        }

        // Si no está en caché o expiró, hacer la petición
        const { getCampaignForDashboard } = await import(
          "@/lib/sanity/queries"
        );
        const campaignData = await getCampaignForDashboard(campaignId, locale);

        // Guardar en caché (por locale)
        campaignsCache[cacheKey] = {
          data: campaignData,
          timestamp: Date.now(),
        };

        return campaignData;
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        throw error;
      }
    },
    [buildCacheKey, locale]
  );

  // Función para cargar detalles de todas las campañas
  const loadCampaignDetails = useCallback(async () => {
    if (!items || items.length === 0) return;

    try {
      setIsCampaignsLoading(true);
      setCampaignsError(null);

      // Obtener IDs únicos de campañas
      const uniqueCampaignIds = Array.from(
        new Set(items.map((item) => item.campaignId))
      );

      // Cargar detalles solo para campañas que no estén ya en el estado
      const campaignsToLoad = uniqueCampaignIds.filter(
        (id) => !campaignDetails[id]
      );

      if (campaignsToLoad.length === 0) {
        setIsCampaignsLoading(false);
        return;
      }

      // Cargar detalles de campañas en paralelo
      const results: Array<{
        id: string;
        data?: CampaignDashboardData;
        error?: unknown;
      }> = await Promise.all(
        campaignsToLoad.map(async (id) => {
          try {
            const data = await getCampaignDetails(id);
            return { id, data };
          } catch (error) {
            console.error(`Error loading campaign ${id}:`, error);
            return { id, error };
          }
        })
      );

      // Actualizar el estado con los nuevos detalles
      setCampaignDetails((prev) => {
        const newDetails = { ...prev };
        results.forEach((result) => {
          if (result.data && !result.error) {
            newDetails[result.id] = result.data;
          }
        });
        return newDetails;
      });
    } catch (error) {
      setCampaignsError("Failed to load campaign details");
      console.error("Error loading campaign details:", error);
    } finally {
      setIsCampaignsLoading(false);
    }
  }, [items, campaignDetails, getCampaignDetails]);

  // Si el locale cambia, reiniciar detalles para recargar en el nuevo idioma
  useEffect(() => {
    setCampaignDetails({});
  }, [locale]);

  return {
    campaignDetails,
    isCampaignsLoading,
    campaignsError,
    loadCampaignDetails,
  };
};

// Helper hook specifically for activities only (pledge history)
export function useUserActivities(limit?: number) {
  const involvement = useUserInvolvement({
    fetchActivity: true,
    activityLimit: limit,
  });

  const {
    campaignDetails,
    isCampaignsLoading,
    campaignsError,
    loadCampaignDetails,
  } = useCampaignDetailsLoader(involvement.activities);

  // Cargar detalles de campañas cuando cambien las actividades
  useEffect(() => {
    if (!involvement.isActivitiesLoading && involvement.activities.length > 0) {
      loadCampaignDetails();
    }
  }, [
    involvement.activities,
    involvement.isActivitiesLoading,
    loadCampaignDetails,
  ]);

  return {
    ...involvement,
    campaignDetails,
    isCampaignsLoading,
    campaignsError,
    loadCampaignDetails,
  };
}

// Helper hook specifically for comments only
export function useUserComments(limit?: number) {
  const involvement = useUserInvolvement({
    fetchComments: true,
    commentsLimit: limit,
  });

  const {
    campaignDetails,
    isCampaignsLoading,
    campaignsError,
    loadCampaignDetails,
  } = useCampaignDetailsLoader(involvement.comments);

  // Cargar detalles de campañas cuando cambien los comentarios
  useEffect(() => {
    if (!involvement.isCommentsLoading && involvement.comments.length > 0) {
      loadCampaignDetails();
    }
  }, [
    involvement.comments,
    involvement.isCommentsLoading,
    loadCampaignDetails,
  ]);

  return {
    ...involvement,
    campaignDetails,
    isCampaignsLoading,
    campaignsError,
    loadCampaignDetails,
  };
}

// Helper hook for complete dashboard data
export function useUserDashboard(
  campaignTitles?: Record<string, { title: string; category: string }>
) {
  return useUserInvolvement({
    fetchDashboard: true,
    campaignTitles,
  });
}
