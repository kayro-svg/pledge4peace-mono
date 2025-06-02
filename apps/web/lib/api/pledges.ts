import { API_URL } from "@/lib/config";
import { getSession } from "next-auth/react";

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
/**
 * Checks if the current user has already pledged to a campaign
 * @param campaignId The ID of the campaign to check
 * @returns Boolean indicating if the user has already pledged
 */
export async function checkExistingPledge(campaignId: string): Promise<boolean> {
  try {
    const session = await getSession();
    const accessToken = session?.accessToken || session?.user?.accessToken;

    if (!accessToken) {
      console.warn("No access token found in session");
      return false;
    }

    const response = await fetch(`${API_URL}/pledges/check/${campaignId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.hasPledged === true;
  } catch (error) {
    console.error("Error checking existing pledge:", error);
    return false;
  }
}

export async function createPledge(data: PledgeData) {
  try {
    // Get the session with all the details
    const session = await getSession();

    // Debug log session info
    console.log("Session object:", session);

    // For authenticated users, include the token
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Get the access token from the session
    // The token might be in the session object directly or in session.user
    const accessToken = session?.accessToken || session?.user?.accessToken;

    if (accessToken) {
      console.log("Access token found in session");
      headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn(
        "No access token found in session. Session keys:",
        Object.keys(session || {})
      );
      if (session?.user) {
        console.log("User object keys:", Object.keys(session.user));
      }
      
      // Si no hay token, intentar refrescar la sesión
      try {
        const refreshedSession = await getSession();
        const refreshedToken = refreshedSession?.accessToken || refreshedSession?.user?.accessToken;
        
        if (refreshedToken) {
          console.log("Access token found after refreshing session");
          headers.Authorization = `Bearer ${refreshedToken}`;
        } else {
          throw new Error("No access token found in session. Please log in again.");
        }
      } catch {
        // Ignoramos el error específico y lanzamos uno genérico
        throw new Error("No access token found in session. Please log in again.");
      }
    }

    console.log("Request headers:", headers);
    console.log("Request payload:", data);

    const response = await fetch(`${API_URL}/pledges`, {
      method: "POST",
      headers,
      credentials: "same-origin", // Changed from 'include' to 'same-origin'
      body: JSON.stringify(data),
    });

    const responseData = await response.json().catch(() => ({}));

    console.log("Response status:", response.status);
    console.log("Response data:", responseData);

    if (!response.ok) {
      throw new Error(
        `Failed to create pledge: ${response.status} ${response.statusText}`,
        {
          cause: responseData.error || "Unknown error",
        }
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error in createPledge:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to create pledge: ${error.message}`, {
        cause: error,
      });
    }
    throw error;
  }
}

/**
 * Gets the current pledge count for a campaign
 * @param campaignId The ID of the campaign
 * @returns The current pledge count
 */
export async function getCampaignPledgeCount(
  campaignId: string
): Promise<number> {
  const response = await fetch(
    `${API_URL}/pledges/campaign/${campaignId}/count`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pledge count");
  }

  const data = await response.json();
  return data.count;
}
