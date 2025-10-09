import { useSession } from "next-auth/react";
import { useMemo } from "react";

/**
 * Optimized session hook that memoizes session data to prevent unnecessary re-renders
 * Use this instead of useSession() in components that only need session data
 */
export function useOptimizedSession() {
  const { data: session, status, update } = useSession();

  // Memoize session data to prevent unnecessary re-renders
  const memoizedSession = useMemo(() => session, [session?.user?.id, session?.accessToken]);
  
  // Memoize status to prevent unnecessary re-renders
  const memoizedStatus = useMemo(() => status, [status]);

  return {
    session: memoizedSession,
    status: memoizedStatus,
    update,
    isAuthenticated: memoizedStatus === "authenticated",
    isLoading: memoizedStatus === "loading",
  };
}
