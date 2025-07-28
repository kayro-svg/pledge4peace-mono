import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/config";
import { logger } from "@/lib/utils/logger";
import { SanityCampaign } from "../types";

// Base API response interface
interface ApiResponse {
  success: boolean;
  message?: string;
}

export interface UserStats {
  totalVotes: number;
  totalLikes: number;
  totalDislikes: number;
  totalShares: number;
  totalComments: number;
  totalPledges: number;
  monthlyVotes: number;
  monthlyComments: number;
  monthlyPledges: number;
}

export interface RecentActivity {
  id: string;
  type: "like" | "dislike" | "share" | "comment" | "pledge";
  solutionId?: string;
  campaignId: string;
  solutionTitle?: string;
  campaignTitle?: string;
  category?: string;
  content?: string;
  createdAt: string;
  rank?: number;
}

export interface RecentComment {
  id: string;
  content: string;
  createdAt: string;
  solutionId: string;
  solutionTitle: string;
  campaignId: string;
  campaignTitle?: string;
  rank?: number;
  likes?: number;
  dislikes?: number;
}

export interface CampaignStats {
  campaignTitle?: string;
  category?: string;
  likes: number;
  dislikes: number;
  shares: number;
  comments: number;
  pledges: number;
}

export interface UserInvolvementData {
  userId: string;
  stats: UserStats;
  recentActivities: RecentActivity[];
  recentComments: RecentComment[];
  solutionLiked: string[];
  solutionDisliked: string[];
  solutionShared: string[];
  campaignStats: Record<string, CampaignStats>;
  userProfileDashboard?: {
    profileStats: {
      participationScore: number;
      consistencyScore: number;
      engagementScore: number;
    };
    userInfo: {
      name: string;
      email: string;
      avatar: string;
    };
    userInterests: {
      category: string;
      color: string;
    }[];
    achievements: {
      icon: string;
      title: string;
      description: string;
    }[];
    userAddress: {
      country: string;
      city: string;
      state: string;
    };
    userSocialMedia: {
      facebook: string;
      twitter: string;
      linkedin: string;
      instagram: string;
    };
  };
}

export interface UserInvolvementApiResponse extends ApiResponse {
  data: UserInvolvementData;
}

export interface UserStatsApiResponse extends ApiResponse {
  data: UserStats;
}

export interface RecentActivityApiResponse extends ApiResponse {
  data: RecentActivity[];
}

export interface RecentCommentsApiResponse extends ApiResponse {
  data: RecentComment[];
}

// Mock data for development/fallback when API is not available
const MOCK_USER_STATS: UserStats = {
  totalVotes: 42,
  totalLikes: 28,
  totalDislikes: 14,
  totalShares: 8,
  totalComments: 15,
  totalPledges: 3,
  monthlyVotes: 12,
  monthlyComments: 5,
  monthlyPledges: 1,
};

const MOCK_RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: "mock-activity-1",
    type: "like",
    solutionId: "mock-solution-1",
    campaignId: "mock-campaign-1",
    solutionTitle:
      "Strengthen Democracy & Accountability within Political Parties",
    campaignTitle: "Democracy Reform Initiative",
    category: "Democracy",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-activity-2",
    type: "comment",
    solutionId: "mock-solution-2",
    campaignId: "mock-campaign-2",
    solutionTitle: "Land Reforms, Eliminate Mafias, and Redistribute Resources",
    campaignTitle: "Economic Justice Campaign",
    category: "Economy",
    content: "This is a very important solution that addresses key issues...",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-activity-3",
    type: "pledge",
    campaignId: "mock-campaign-3",
    campaignTitle: "Environmental Protection Initiative",
    category: "Environment",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_RECENT_COMMENTS: RecentComment[] = [
  {
    id: "mock-comment-1",
    content:
      "I believe this solution is fundamental for democratic development. We need more transparent and accountable political parties that account to citizens and not to economic powers.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    solutionId: "mock-solution-1",
    solutionTitle:
      "Strengthen Democracy & Accountability within Political Parties",
    campaignId: "mock-campaign-1",
    campaignTitle: "Democracy Reform Initiative",
    rank: 1,
  },
  {
    id: "mock-comment-2",
    content:
      "The redistribution of resources is key to reducing inequality, but it must be done with a solid legal framework that prevents corruption and ensures that benefits reach those who really need them.",
    createdAt: new Date(Date.now() - 1 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    solutionId: "mock-solution-2",
    solutionTitle: "Land Reforms, Eliminate Mafias, and Redistribute Resources",
    campaignId: "mock-campaign-2",
    campaignTitle: "Economic Justice Campaign",
    rank: 2,
  },
];

// Cache for user involvement data to prevent excessive API calls
const userInvolvementCache: Record<string, { data: any; timestamp: number }> =
  {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime

/**
 * Get complete user involvement dashboard data
 * Now uses apiClient with automatic session management
 */
export async function getDashboard(
  campaignTitles?: Record<string, { title: string; category: string }>
): Promise<UserInvolvementData> {
  try {
    logger.log("[API] Fetching user involvement dashboard data");

    // Check cache first
    const cacheKey = `dashboard-${JSON.stringify(campaignTitles || {})}`;
    const cachedData = userInvolvementCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      logger.log("[API] Using cached dashboard data");
      return cachedData.data;
    }

    try {
      // Build query params if campaignTitles provided
      const params = new URLSearchParams();
      if (campaignTitles) {
        params.append("campaignTitles", JSON.stringify(campaignTitles));
      }

      const endpoint = `${API_ENDPOINTS.userInvolvement.dashboard}${params.toString() ? `?${params.toString()}` : ""}`;
      const sanitizedEndpoint = endpoint.replace(
        process.env.NEXT_PUBLIC_API_URL || "",
        ""
      );
      const response =
        await apiClient.get<UserInvolvementApiResponse>(sanitizedEndpoint);

      // Cache the response
      userInvolvementCache[cacheKey] = {
        data: response.data,
        timestamp: Date.now(),
      };

      logger.log("[API] Successfully fetched user involvement dashboard data");
      return response.data;
    } catch (error) {
      // apiClient handles session expiration automatically
      logger.warn(
        "[API] Error fetching dashboard data, using mock data:",
        error
      );

      // Return cached data if available
      if (cachedData) {
        return cachedData.data;
      }

      // Return mock data for development
      if (process.env.NODE_ENV === "development") {
        return {
          userId: "mock-user",
          stats: MOCK_USER_STATS,
          recentActivities: MOCK_RECENT_ACTIVITIES,
          recentComments: MOCK_RECENT_COMMENTS,
          solutionLiked: ["mock-solution-1"],
          solutionDisliked: [],
          solutionShared: [],
          campaignStats: {
            "mock-campaign-1": {
              campaignTitle: "Democracy Reform Initiative",
              category: "Democracy",
              likes: 5,
              dislikes: 1,
              shares: 2,
              comments: 3,
              pledges: 1,
            },
          },
        };
      }

      throw error;
    }
  } catch (error) {
    logger.error("[API] Error in getDashboard:", error);

    // Return mock data for development as fallback
    if (process.env.NODE_ENV === "development") {
      return {
        userId: "mock-user",
        stats: MOCK_USER_STATS,
        recentActivities: MOCK_RECENT_ACTIVITIES,
        recentComments: MOCK_RECENT_COMMENTS,
        solutionLiked: ["mock-solution-1"],
        solutionDisliked: [],
        solutionShared: [],
        campaignStats: {},
      };
    }

    if (error instanceof Error) {
      throw new Error(`Failed to fetch dashboard data: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get user involvement statistics only
 * Now uses apiClient with automatic session management
 */
export async function getStats(): Promise<UserStats> {
  try {
    logger.log("[API] Fetching user involvement stats");

    // Check cache first
    const cacheKey = "stats";
    const cachedData = userInvolvementCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      logger.log("[API] Using cached stats data");
      return cachedData.data;
    }

    try {
      const endpoint = API_ENDPOINTS.userInvolvement.stats.replace(
        process.env.NEXT_PUBLIC_API_URL || "",
        ""
      );

      const response = await apiClient.get<UserStatsApiResponse>(endpoint);

      // Cache the response
      userInvolvementCache[cacheKey] = {
        data: response.data,
        timestamp: Date.now(),
      };

      logger.log("[API] Successfully fetched user involvement stats");
      return response.data;
    } catch (error) {
      // apiClient handles session expiration automatically
      logger.warn("[API] Error fetching stats, using mock data:", error);

      // Return cached data if available
      if (cachedData) {
        return cachedData.data;
      }

      // Return mock data for development
      if (process.env.NODE_ENV === "development") {
        return MOCK_USER_STATS;
      }

      throw error;
    }
  } catch (error) {
    logger.error("[API] Error in getStats:", error);

    // Return mock data for development as fallback
    if (process.env.NODE_ENV === "development") {
      return MOCK_USER_STATS;
    }

    if (error instanceof Error) {
      throw new Error(`Failed to fetch user stats: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get user recent activities
 * Now uses apiClient with automatic session management
 */
export async function getActivity(limit?: number): Promise<RecentActivity[]> {
  try {
    logger.log(`[API] Fetching user recent activities (limit: ${limit || 20})`);

    // Check cache first
    const cacheKey = `activity-${limit || 20}`;
    const cachedData = userInvolvementCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      logger.log("[API] Using cached activity data");
      return cachedData.data;
    }

    try {
      const params = new URLSearchParams();
      if (limit) {
        params.append("limit", limit.toString());
      }

      const endpoint = `${API_ENDPOINTS.userInvolvement.activity}${params.toString() ? `?${params.toString()}` : ""}`;
      const sanitizedEndpoint = endpoint.replace(
        process.env.NEXT_PUBLIC_API_URL || "",
        ""
      );
      const response =
        await apiClient.get<RecentActivityApiResponse>(sanitizedEndpoint);

      // Cache the response
      userInvolvementCache[cacheKey] = {
        data: response.data,
        timestamp: Date.now(),
      };

      logger.log("[API] Successfully fetched user recent activities");
      return response.data;
    } catch (error) {
      // apiClient handles session expiration automatically
      logger.warn("[API] Error fetching activities, using mock data:", error);

      // Return cached data if available
      if (cachedData) {
        return cachedData.data;
      }

      // Return mock data for development
      if (process.env.NODE_ENV === "development") {
        return MOCK_RECENT_ACTIVITIES.slice(0, limit || 20);
      }

      throw error;
    }
  } catch (error) {
    logger.error("[API] Error in getActivity:", error);

    // Return mock data for development as fallback
    if (process.env.NODE_ENV === "development") {
      return MOCK_RECENT_ACTIVITIES.slice(0, limit || 20);
    }

    if (error instanceof Error) {
      throw new Error(`Failed to fetch user activities: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get user recent comments
 * Now uses apiClient with automatic session management
 */
export async function getComments(limit?: number): Promise<RecentComment[]> {
  try {
    logger.log(`[API] Fetching user recent comments (limit: ${limit || 10})`);

    // Check cache first
    const cacheKey = `comments-${limit || 10}`;
    const cachedData = userInvolvementCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      logger.log("[API] Using cached comments data");
      return cachedData.data;
    }

    try {
      const params = new URLSearchParams();
      if (limit) {
        params.append("limit", limit.toString());
      }

      const endpoint = `${API_ENDPOINTS.userInvolvement.comments}${params.toString() ? `?${params.toString()}` : ""}`;

      const sanitizedEndpoint = endpoint.replace(
        process.env.NEXT_PUBLIC_API_URL || "",
        ""
      );

      const response =
        await apiClient.get<RecentCommentsApiResponse>(sanitizedEndpoint);

      // Cache the response
      userInvolvementCache[cacheKey] = {
        data: response.data,
        timestamp: Date.now(),
      };

      logger.log("[API] Successfully fetched user recent comments");
      return response.data;
    } catch (error) {
      // apiClient handles session expiration automatically
      logger.warn("[API] Error fetching comments, using mock data:", error);

      // Return cached data if available
      if (cachedData) {
        return cachedData.data;
      }

      // Return mock data for development
      if (process.env.NODE_ENV === "development") {
        return MOCK_RECENT_COMMENTS.slice(0, limit || 10);
      }

      throw error;
    }
  } catch (error) {
    logger.error("[API] Error in getComments:", error);

    // Return mock data for development as fallback
    if (process.env.NODE_ENV === "development") {
      return MOCK_RECENT_COMMENTS.slice(0, limit || 10);
    }

    if (error instanceof Error) {
      throw new Error(`Failed to fetch user comments: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Invalidate user involvement cache
 * Useful after user performs actions that would change their involvement data
 */
export function invalidateUserInvolvementCache(): void {
  Object.keys(userInvolvementCache).forEach((key) => {
    delete userInvolvementCache[key];
  });
  logger.log("[Cache] Invalidated user involvement cache");
}

// Helper functions for UI formatting (same as before)
export function formatActivityType(type: RecentActivity["type"]): string {
  switch (type) {
    case "like":
      return "Liked";
    case "dislike":
      return "Disliked";
    case "share":
      return "Shared";
    case "comment":
      return "Commented on";
    case "pledge":
      return "Pledged to";
    default:
      return type;
  }
}

export function formatActivityDescription(
  activity: RecentActivity,
  campaignDetails: Record<string, { title: string; id: string; slug?: string }>
): string {
  const actionType = formatActivityType(activity.type);

  // Usar el título de la campaña si está disponible en campaignDetails
  const campaignTitle =
    campaignDetails[activity.campaignId]?.title ||
    activity.campaignTitle ||
    "a campaign";

  if (activity.type === "pledge") {
    return `${actionType} ${campaignTitle}`;
  }

  return `${actionType} "${activity.solutionTitle || "solution"}" in ${campaignTitle}`;
}

export function getActivityIcon(type: RecentActivity["type"]): string {
  switch (type) {
    case "like":
      return "👍";
    case "dislike":
      return "👎";
    case "share":
      return "📤";
    case "comment":
      return "💬";
    case "pledge":
      return "🤝";
    default:
      return "📝";
  }
}

export function getActivityColor(type: RecentActivity["type"]): string {
  switch (type) {
    case "like":
      return "text-green-600";
    case "dislike":
      return "text-red-600";
    case "share":
      return "text-blue-600";
    case "comment":
      return "text-purple-600";
    case "pledge":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
}
