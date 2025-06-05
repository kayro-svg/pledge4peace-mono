import { Solution, Comment, CreateCommentDto } from "@/lib/types/index";
import { getSession } from "next-auth/react";
import { API_ENDPOINTS } from "@/lib/config";
import { API_URL } from "@/lib/config";

// Cache solutions by campaign ID to prevent excessive API calls
const solutionsCache: Record<string, { data: Solution[]; timestamp: number }> =
  {};
const SOLUTIONS_CACHE_TTL = 60000; // 60 seconds cache lifetime for solutions

export async function getSolutions(campaignId: string): Promise<Solution[]> {
  // Use cached data if available and not expired
  if (
    solutionsCache[campaignId] &&
    Date.now() - solutionsCache[campaignId].timestamp < SOLUTIONS_CACHE_TTL
  ) {
    return solutionsCache[campaignId].data;
  }

  try {
    const response: Response = await fetch(
      API_ENDPOINTS.solutions.getByCampaign(campaignId)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch solutions");
    }

    const data = await response.json();

    // Cache the solution data
    solutionsCache[campaignId] = {
      data,
      timestamp: Date.now(),
    };

    return data;
  } catch (error) {
    console.error("Error fetching solutions:", error);
    // Return cached data if available, even if expired
    if (solutionsCache[campaignId]) {
      return solutionsCache[campaignId].data;
    }
    // If no cache is available, rethrow the error or return an empty array
    return [];
  }
}

export async function likeSolution(solutionId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/solutions/${solutionId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to like solution");
  }

  return response.json();
}

export async function dislikeSolution(solutionId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/solutions/${solutionId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to dislike solution");
  }

  return response.json();
}

export async function shareSolution(solutionId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/solutions/${solutionId}/share`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to share solution");
  }

  return response.json();
}

// Cache for solution stats to prevent excessive API calls
const statsCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime

export async function getSolutionStats(solutionId: string) {
  try {
    // Check cache first
    const cachedStats = statsCache[solutionId];
    if (cachedStats && Date.now() - cachedStats.timestamp < CACHE_TTL) {
      return cachedStats.data;
    }

    const session = await getSession();
    const response = await fetch(`${API_URL}/solutions/${solutionId}/stats`, {
      headers: session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {},
    });

    if (!response.ok) {
      throw new Error("Failed to get solution stats");
    }

    const data = await response.json();

    // Cache the response
    statsCache[solutionId] = {
      data,
      timestamp: Date.now(),
    };

    return data;
  } catch (error) {
    console.error("Error fetching solution stats:", error);
    // Return cached data if available, even if expired
    if (statsCache[solutionId]) {
      console.log("Using cached stats for solution:", solutionId);
      return statsCache[solutionId].data;
    }
    // Otherwise return default stats
    return { likes: 0, dislikes: 0, shares: 0, comments: 0 };
  }
}

// Cache for user interactions
const userInteractionsCache: Record<
  string,
  {
    data: { hasLiked: boolean; hasDisliked: boolean; hasShared: boolean };
    timestamp: number;
  }
> = {};
const USER_INTERACTIONS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime

export async function getUserInteractions(solutionId: string) {
  // Get session only once and cache it
  const session = await getSession();

  try {
    // If no session or no access token, return default values immediately without API call
    if (!session?.accessToken) {
      return {
        hasLiked: false,
        hasDisliked: false,
        hasShared: false,
      };
    }

    // Check if we have cached data for this solution and user session
    const cacheKey = `${solutionId}-${session.user?.email || "anonymous"}`;
    const cachedData = userInteractionsCache[cacheKey];

    if (
      cachedData &&
      Date.now() - cachedData.timestamp < USER_INTERACTIONS_CACHE_TTL
    ) {
      return cachedData.data;
    }

    const response = await fetch(
      API_ENDPOINTS.solutions.userInteractions(solutionId),
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    // Handle different response statuses
    if (response.status === 401 || response.status === 403) {
      // Authentication error - return default values
      return {
        hasLiked: false,
        hasDisliked: false,
        hasShared: false,
      };
    }

    if (!response.ok) {
      console.error(`Failed to get user interactions: ${response.status}`);
      // Return cached data if available
      if (cachedData) {
        return cachedData.data;
      }
      // Otherwise return default values
      return {
        hasLiked: false,
        hasDisliked: false,
        hasShared: false,
      };
    }

    const data = await response.json();

    // Cache the response
    userInteractionsCache[cacheKey] = {
      data,
      timestamp: Date.now(),
    };

    return data;
  } catch (error) {
    console.error("Error fetching user interactions:", error);
    // Check if we have cached data
    const cacheKey = `${solutionId}-${session?.user?.email || "anonymous"}`;
    const cachedData = userInteractionsCache[cacheKey];
    if (cachedData) {
      return cachedData.data;
    }
    // Return default values if no cache available
    return {
      hasLiked: false,
      hasDisliked: false,
      hasShared: false,
    };
  }
}

export async function getComments(solutionId: string): Promise<Comment[]> {
  const response = await fetch(
    API_ENDPOINTS.comments.getBySolution(solutionId)
  );

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
}

export async function createComment(data: CreateCommentDto): Promise<Comment> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(API_ENDPOINTS.comments.create(data.solutionId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
}
