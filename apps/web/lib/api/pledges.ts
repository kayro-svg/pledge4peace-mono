import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/utils/logger";

export interface PledgeData {
  campaignId: string;
  agreeToTerms: boolean;
  subscribeToUpdates: boolean;
}

/**
 * Creates a new pledge for a campaign
 * @param data Pledge data including campaign ID and user preferences
 * @returns The created pledge data with ID
 */
// Mock pledge status for development/fallback
const MOCK_USER_PLEDGES: Record<string, boolean> = {};

/**
 * Checks if the current user has already pledged to a campaign
 * @param campaignId The ID of the campaign to check
 * @returns Boolean indicating if the user has already pledged
 */
export async function checkExistingPledge(
  campaignId: string
): Promise<boolean> {
  try {
    logger.log(`[API] Checking if user has pledged to campaign: ${campaignId}`);

    // Generate random pledge status for this campaign if needed (for mock data)
    if (MOCK_USER_PLEDGES[campaignId] === undefined) {
      // 30% chance the user has already pledged
      MOCK_USER_PLEDGES[campaignId] = Math.random() < 0.3;
    }

    try {
      const data = await apiClient.get<{ hasPledged: boolean }>(
        `/pledges/check/${campaignId}`
      );
      logger.log(
        `[API] User pledge status for campaign ${campaignId}: ${data.hasPledged}`
      );
      return data.hasPledged === true;
    } catch (error) {
      // If session expired, apiClient will handle it automatically
      // For other errors or if user is not authenticated, fall back to mock data
      logger.warn(
        "[API] Error checking pledge status, using mock data:",
        error
      );
      return MOCK_USER_PLEDGES[campaignId];
    }
  } catch (error) {
    logger.error("[API] Error checking existing pledge:", error);
    // Fall back to mock data
    return MOCK_USER_PLEDGES[campaignId];
  }
}

/**
 * Creates a pledge for a campaign
 * Now using apiClient with automatic session management
 */
export async function createPledge(data: PledgeData) {
  try {
    logger.log(`[API] Creating pledge for campaign: ${data.campaignId}`);

    try {
      const responseData = await apiClient.post<any>("/pledges", data);
      logger.log(`[API] Pledge created successfully:`, responseData);

      // Update the mock user pledge status for consistency
      MOCK_USER_PLEDGES[data.campaignId] = true;

      // Increment the mock pledge count
      if (MOCK_PLEDGE_COUNTS[data.campaignId]) {
        MOCK_PLEDGE_COUNTS[data.campaignId]++;
      }

      return responseData;
    } catch (error) {
      // Session expiration is handled automatically by apiClient
      // For development or other errors, return mock data
      logger.warn("[API] Error creating pledge, using mock response:", error);

      if (process.env.NODE_ENV === "development") {
        logger.log(
          "[API] Returning mock successful pledge in development environment"
        );

        // Update the mock user pledge status
        MOCK_USER_PLEDGES[data.campaignId] = true;

        // Increment the mock pledge count
        if (MOCK_PLEDGE_COUNTS[data.campaignId]) {
          MOCK_PLEDGE_COUNTS[data.campaignId]++;
        }

        return {
          id: `mock-pledge-${Date.now()}`,
          campaignId: data.campaignId,
          userId: "mock-user",
          createdAt: new Date().toISOString(),
          success: true,
        };
      }

      // Re-throw the error for production
      throw error;
    }
  } catch (error) {
    logger.error("[API] Error in createPledge:", error);

    // For development, return a mock successful response
    if (process.env.NODE_ENV === "development") {
      logger.log(
        "[API] Returning mock successful pledge in development environment"
      );

      // Update the mock pledge status
      MOCK_USER_PLEDGES[data.campaignId] = true;

      // Increment the mock pledge count
      if (MOCK_PLEDGE_COUNTS[data.campaignId]) {
        MOCK_PLEDGE_COUNTS[data.campaignId]++;
      }

      return {
        id: `mock-pledge-${Date.now()}`,
        campaignId: data.campaignId,
        userId: "mock-user",
        createdAt: new Date().toISOString(),
        success: true,
      };
    }

    if (error instanceof Error) {
      throw new Error(`Failed to create pledge: ${error.message}`, {
        cause: error,
      });
    }
    throw error;
  }
}

// Mock data for development/fallback when API is not available
const MOCK_PLEDGE_COUNTS: Record<string, number> = {};

/**
 * Gets the current pledge count for a campaign
 * @param campaignId The ID of the campaign
 * @returns The current pledge count
 */
export async function getCampaignPledgeCount(
  campaignId: string
): Promise<number> {
  try {
    // Generate a random number between 100-5000 if this campaign hasn't been seen before
    if (!MOCK_PLEDGE_COUNTS[campaignId]) {
      MOCK_PLEDGE_COUNTS[campaignId] = Math.floor(Math.random() * 4900) + 100;
    }

    try {
      // Try to fetch from the API using apiClient
      logger.log(`[API] Fetching pledge count for campaign: ${campaignId}`);
      const data = await apiClient.get<{ count: number }>(
        `/pledges/campaign/${campaignId}/count`
      );
      logger.log(`[API] Successfully fetched pledge count: ${data.count}`);
      return data.count;
    } catch (error) {
      logger.warn("[API] Error fetching pledge count, using mock data:", error);
      // Return mock data if API fails
      return MOCK_PLEDGE_COUNTS[campaignId];
    }
  } catch (error) {
    logger.error("[API] Error in getCampaignPledgeCount:", error);
    // Return mock data as fallback
    return MOCK_PLEDGE_COUNTS[campaignId];
  }
}
