"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { logger } from "@/lib/utils/logger";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  image: string | null;
  userType: string | null;
  office: string | null;
  organization: string | null;
  nonprofit: string | null;
  institution: string | null;
  otherRole: string | null;
  role: string;
}

async function getServerSideUserProfile(): Promise<UserProfile> {
  try {
    // Obtener la sesión del servidor usando NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      logger.warn("No session or access token found");
      logger.log("Session status:", {
        hasSession: !!session,
        hasAccessToken: !!session?.accessToken,
      });
      throw new Error("No authentication token found");
    }

    const backendAccessToken = session.accessToken as string;

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendAccessToken}`,
      },
      // Importante: no usar cache para datos de usuario
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.log("Profile request failed:", response.status, errorText);

      if (response.status === 401) {
        throw new Error("Unauthorized - please log in again");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const profile: UserProfile = await response.json();
    return profile;
  } catch (error) {
    logger.error("Error fetching user profile from server:", error);
    throw error;
  }
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    return await getServerSideUserProfile();
  } catch (error) {
    logger.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}

export async function getUserOrganizationAndType(): Promise<{
  userType: string | null;
  organization: string | null;
  nonprofit: string | null;
  institution: string | null;
  otherRole: string | null;
  office: string | null;
}> {
  try {
    const profile = await getServerSideUserProfile();
    return {
      userType: profile.userType,
      organization: profile.organization,
      nonprofit: profile.nonprofit,
      institution: profile.institution,
      otherRole: profile.otherRole,
      office: profile.office,
    };
  } catch (error) {
    logger.error("Error fetching user organization and type:", error);
    throw new Error("Failed to fetch user organization and type");
  }
}
