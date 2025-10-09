import { useSession } from "next-auth/react";

/**
 * Simplified auth hook for debugging 401 issues
 * This bypasses the complex token validation in useAuthSession
 */
export function useSimpleAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    status,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
    accessToken: session?.accessToken,
  };
}
