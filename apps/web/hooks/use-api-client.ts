import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

/**
 * Hook to keep apiClient synchronized with session token
 * This prevents getSession() calls in apiClient by using the session context
 */
export function useApiClient() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      // Update apiClient with current token
      apiClient.setToken(session.accessToken);
    } else if (status === "unauthenticated") {
      // Clear token when unauthenticated
      apiClient.setToken(null);
    }
  }, [session?.accessToken, status]);

  return apiClient;
}

/**
 * Global hook to ensure apiClient is always synchronized
 * Use this in the root layout or main providers
 */
export function useGlobalApiClientSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[ApiClient Sync] Session status changed:", {
        status,
        hasSession: !!session,
        hasAccessToken: !!session?.accessToken,
        tokenLength: session?.accessToken?.length || 0,
      });
    }

    if (status === "authenticated" && session?.accessToken) {
      apiClient.setToken(session.accessToken);
    } else if (status === "unauthenticated") {
      apiClient.setToken(null);
    }
  }, [session?.accessToken, status]);
}
