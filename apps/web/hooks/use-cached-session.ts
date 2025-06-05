import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { sessionCache } from "@/lib/session-cache";

export function useCachedSession() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.id && status === "authenticated") {
      sessionCache.setSession(session.user.id, session);
    }
  }, [session, status]);

  const getCachedSession = () => {
    if (!session?.user?.id) return null;
    return sessionCache.getSession(session.user.id);
  };

  return {
    session: getCachedSession() || session,
    status,
    isAuthenticated: status === "authenticated",
  };
}
