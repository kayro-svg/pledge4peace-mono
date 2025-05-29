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
export async function createPledge(data: PledgeData) {
  const session = await getSession();

  // For authenticated users, include the token
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${API_URL}/pledges`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create pledge");
  }

  return response.json();
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
