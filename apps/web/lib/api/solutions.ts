import { Solution, Comment, CreateCommentDto } from "@/lib/types/index";
import { API_ENDPOINTS } from "@/lib/config";
import { logger } from "@/lib/utils/logger";
import { apiClient } from "@/lib/api-client";

// Cache solutions by campaign ID to prevent excessive API calls
const solutionsCache: Record<string, { data: Solution[]; timestamp: number }> =
  {};
const SOLUTIONS_CACHE_TTL = 60000; // 60 seconds cache lifetime for solutions

/**
 * Invalida el cache de solutions para una campaña específica
 * Útil para forzar una recarga después de cambios como eliminaciones
 */
export function invalidateSolutionsCache(campaignId: string) {
  delete solutionsCache[campaignId];
}

/**
 * Invalida todos los caches relacionados con solutions
 */
export function invalidateAllSolutionsCache() {
  // Limpiar cache de solutions
  Object.keys(solutionsCache).forEach((key) => {
    delete solutionsCache[key];
  });

  // Limpiar cache de stats
  Object.keys(statsCache).forEach((key) => {
    delete statsCache[key];
  });

  // Limpiar cache de user interactions
  Object.keys(userInteractionsCache).forEach((key) => {
    delete userInteractionsCache[key];
  });
}

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
    logger.error("Error fetching solutions:", error);
    // Return cached data if available, even if expired
    if (solutionsCache[campaignId]) {
      return solutionsCache[campaignId].data;
    }
    // If no cache is available, rethrow the error or return an empty array
    return [];
  }
}

export async function submitSolution(payload: {
  campaignId: string;
  title: string;
  description: string;
  partyId: string;
  partyLimits?: Record<string, number>;
  metadata?: Record<string, any>;
}): Promise<Solution> {
  // Always submit as draft (pending moderation)
  const endpoint = API_ENDPOINTS.solutions.create.replace(
    process.env.NEXT_PUBLIC_API_URL || "",
    ""
  );
  const data = await apiClient.post<Solution>(endpoint, {
    ...payload,
    status: "draft",
  });
  // invalidate cache so list refresh reflects moderation state if needed
  invalidateSolutionsCache(payload.campaignId);
  return data;
}

export async function approveSolution(id: string): Promise<any> {
  const endpoint = API_ENDPOINTS.solutions
    .updateStatus(id)
    .replace(process.env.NEXT_PUBLIC_API_URL || "", "");
  return apiClient.patch(endpoint, { status: "published" });
}

export async function rejectSolution(
  id: string,
  reason?: string
): Promise<any> {
  const endpoint = API_ENDPOINTS.solutions
    .updateStatus(id)
    .replace(process.env.NEXT_PUBLIC_API_URL || "", "");
  return apiClient.patch(endpoint, { status: "archived", reason });
}

export async function updateSolution(
  id: string,
  payload: Partial<{
    title: string;
    description: string;
    partyId: string;
    metadata: Record<string, any> | null;
  }>
) {
  const endpoint = API_ENDPOINTS.solutions
    .update(id)
    .replace(process.env.NEXT_PUBLIC_API_URL || "", "");
  const data = await apiClient.patch(endpoint, payload);
  // Invalidate caches broadly since content changed
  invalidateAllSolutionsCache();
  return data as Solution;
}

export async function revertSolutionToDraft(
  id: string,
  reason?: string
): Promise<any> {
  const endpoint = API_ENDPOINTS.solutions
    .updateStatus(id)
    .replace(process.env.NEXT_PUBLIC_API_URL || "", "");
  return apiClient.patch(endpoint, { status: "draft", reason });
}

export type ModerationRow = {
  id: string;
  title: string;
  description: string;
  author: string;
  submittedAt: string;
  status: "draft" | "published" | "archived";
  campaignId: string;
  partyId: string;
};

export async function getModerationList(params?: {
  status?: "draft" | "published" | "archived";
  campaignId?: string;
  page?: number;
  limit?: number;
  q?: string;
}): Promise<{
  items: ModerationRow[];
  total: number;
  page: number;
  limit: number;
}> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.campaignId) qs.set("campaignId", params.campaignId);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.q) qs.set("q", params.q);
  const path = `/solutions/moderation/list${qs.toString() ? `?${qs.toString()}` : ""}`;
  return apiClient.get(path);
}

export async function approveAllDrafts(campaignId?: string) {
  const qs = new URLSearchParams();
  if (campaignId) qs.set("campaignId", campaignId);
  const path = `/solutions/moderation/approve-all${qs.toString() ? `?${qs.toString()}` : ""}`;
  return apiClient.post(path);
}

export async function likeSolution(solutionId: string) {
  try {
    return await apiClient.post<{
      liked: boolean;
      stats: {
        likes: number;
        dislikes: number;
        shares: number;
      };
      userInteractions: {
        hasLiked: boolean;
        hasDisliked: boolean;
        hasShared: boolean;
      };
    }>(`/solutions/${solutionId}/like`);
  } catch (error) {
    // apiClient handles session expiration automatically
    throw new Error("Failed to like solution");
  }
}

export async function dislikeSolution(solutionId: string) {
  try {
    return await apiClient.post<{
      disliked: boolean;
      stats: {
        likes: number;
        dislikes: number;
        shares: number;
      };
      userInteractions: {
        hasLiked: boolean;
        hasDisliked: boolean;
        hasShared: boolean;
      };
    }>(`/solutions/${solutionId}/dislike`);
  } catch (error) {
    // apiClient handles session expiration automatically
    throw new Error("Failed to dislike solution");
  }
}

export async function shareSolution(solutionId: string) {
  try {
    return await apiClient.post(`/solutions/${solutionId}/share`);
  } catch (error) {
    // apiClient handles session expiration automatically
    throw new Error("Failed to share solution");
  }
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

    try {
      const data = await apiClient.get<any>(`/solutions/${solutionId}/stats`);

      // Cache the response
      statsCache[solutionId] = {
        data,
        timestamp: Date.now(),
      };

      return data;
    } catch (error) {
      logger.error("Error fetching solution stats:", error);
      // Return cached data if available, even if expired
      if (statsCache[solutionId]) {
        logger.log("Using cached stats for solution:", solutionId);
        return statsCache[solutionId].data;
      }
      // Otherwise return default stats
      return { likes: 0, dislikes: 0, shares: 0, comments: 0 };
    }
  } catch (error) {
    logger.error("Error fetching solution stats:", error);
    // Return cached data if available, even if expired
    if (statsCache[solutionId]) {
      logger.log("Using cached stats for solution:", solutionId);
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
  try {
    // Check if we have cached data for this solution
    const cacheKey = `${solutionId}-user-interactions`;
    const cachedData = userInteractionsCache[cacheKey];

    // if (
    //   cachedData &&
    //   Date.now() - cachedData.timestamp < USER_INTERACTIONS_CACHE_TTL
    // ) {
    //   return cachedData.data;
    // }

    try {
      const data = await apiClient.get<{
        hasLiked: boolean;
        hasDisliked: boolean;
        hasShared: boolean;
      }>(`/solutions/${solutionId}/user-interactions`);

      // Cache the response
      // userInteractionsCache[cacheKey] = {
      //   data,
      //   timestamp: Date.now(),
      // };

      return data;
    } catch (error) {
      // If session expired, apiClient handles it automatically
      // For other errors or if user is not authenticated, return default values
      logger.warn("Error fetching user interactions, using defaults:", error);

      // Return cached data if available
      // if (cachedData) {
      //   return cachedData.data;
      // }

      // Otherwise return default values
      return {
        hasLiked: false,
        hasDisliked: false,
        hasShared: false,
      };
    }
  } catch (error) {
    logger.error("Error fetching user interactions:", error);
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
  try {
    // Extract endpoint path from API_ENDPOINTS.comments.create
    const endpoint = API_ENDPOINTS.comments
      .create(data.solutionId)
      .replace(process.env.NEXT_PUBLIC_API_URL || "", "");

    // Prepare request body with parentId if it exists
    const requestBody = {
      content: data.content,
      solutionId: data.solutionId,
      ...(data.parentId && { parentId: data.parentId }),
      ...(data.userName && { userName: data.userName }),
      ...(data.userAvatar && { userAvatar: data.userAvatar }),
    };

    return await apiClient.post<Comment>(endpoint, requestBody);
  } catch (error) {
    // apiClient handles session expiration automatically
    throw new Error("Failed to create comment");
  }
}

/**
 * Elimina una solution específica
 * Solo permitido para el propietario o superAdmin
 */
export async function deleteSolution(
  solutionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const data = await apiClient.delete<{ success: boolean; message: string }>(
      `/solutions/${solutionId}`
    );

    // Invalidar todos los caches después de eliminar exitosamente
    invalidateAllSolutionsCache();

    return data;
  } catch (error) {
    // apiClient handles session expiration automatically
    throw new Error("Failed to delete solution");
  }
}

/**
 * Elimina un comment específico
 * Solo permitido para el propietario o superAdmin
 */
export async function deleteComment(commentId: string): Promise<{
  success: boolean;
  message: string;
  deletedReplies?: string[];
}> {
  try {
    const endpoint = API_ENDPOINTS.comments
      .delete(commentId)
      .replace(process.env.NEXT_PUBLIC_API_URL || "", "");

    return await apiClient.delete(endpoint);
  } catch (error) {
    // apiClient handles session expiration automatically
    throw new Error("Failed to delete comment");
  }
}
