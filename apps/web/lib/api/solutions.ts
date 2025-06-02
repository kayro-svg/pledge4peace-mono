import { Solution, Comment, CreateCommentDto } from "@/lib/types/index";
import { getSession } from "next-auth/react";
import { API_ENDPOINTS } from "@/lib/config";
import { API_URL } from "@/lib/config";

/**
 * Gets the number of solutions the current user has created for a campaign
 * @param campaignId The ID of the campaign
 * @returns The number of solutions the user has created for the campaign
 */
export async function getUserSolutionCount(
  campaignId: string
): Promise<number> {
  try {
    const session = await getSession();

    // If no session, return 0 immediately without making API call
    if (!session?.accessToken) {
      return 0;
    }

    const response = await fetch(
      `${API_URL}/solutions/user-count/${campaignId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("User not authenticated for solution count");
        return 0;
      }
      throw new Error("Failed to get user solution count");
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error("Error getting user solution count:", error);
    return 0; // Default to 0 if there's an error
  }
}

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
const CACHE_TTL = 30000; // 30 seconds cache lifetime

export async function getSolutionStats(solutionId: string) {
  try {
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
    // statsCache[solutionId] = {
    //   data,
    //   timestamp: Date.now(),
    // };

    return data;
  } catch (error) {
    console.error("Error fetching solution stats:", error);
    // Return cached data if available, even if expired
    // if (statsCache[solutionId]) {
    //   console.log("Using cached stats for solution:", solutionId);
    //   return statsCache[solutionId].data;
    // }
    // // Otherwise return default stats
    // return { likes: 0, dislikes: 0, shares: 0, comments: 0 };
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
const USER_INTERACTIONS_CACHE_TTL = 30000; // 30 seconds cache lifetime

export async function getUserInteractions(solutionId: string) {
  // Get session only once and cache it
  const session = await getSession();

  // If no session, return default values immediately without API call
  if (!session?.accessToken) {
    return {
      hasLiked: false,
      hasDisliked: false,
      hasShared: false,
    };
  }

  // Check if we have cached data for this solution and user session
  const cacheKey = `${solutionId}-${session.user?.email || "anonymous"}`;
  if (
    userInteractionsCache[cacheKey] &&
    Date.now() - userInteractionsCache[cacheKey].timestamp <
      USER_INTERACTIONS_CACHE_TTL
  ) {
    return userInteractionsCache[cacheKey].data;
  }

  try {
    const response = await fetch(
      `${API_URL}/solutions/${solutionId}/user-interactions`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Return default values for unauthorized users
        const defaultData = {
          hasLiked: false,
          hasDisliked: false,
          hasShared: false,
        };

        // Cache the default response
        userInteractionsCache[cacheKey] = {
          data: defaultData,
          timestamp: Date.now(),
        };

        return defaultData;
      }
      throw new Error("Failed to get user interactions");
    }

    const data = await response.json();

    // Cache the response
    userInteractionsCache[cacheKey] = {
      data,
      timestamp: Date.now(),
    };

    return data;
  } catch (error) {
    console.error("Error getting user interactions:", error);
    // Return cached data if available, even if expired
    if (userInteractionsCache[cacheKey]) {
      return userInteractionsCache[cacheKey].data;
    }
    // Default values if no cache available
    return {
      hasLiked: false,
      hasDisliked: false,
      hasShared: false,
    };
  }
}

export async function getComments(solutionId: string): Promise<Comment[]> {
  const session = await getSession();
  const response = await fetch(
    API_ENDPOINTS.comments.getBySolution(solutionId),
    {
      headers: session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {},
    }
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
