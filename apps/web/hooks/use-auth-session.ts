import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface AuthSessionReturn {
  session: any;
  status: "loading" | "authenticated" | "unauthenticated";
  isAuthenticated: boolean;
  isTokenValid: boolean;
  checkTokenValidity: () => boolean;
  handleAuthError: () => Promise<void>;
}

export function useAuthSession(): AuthSessionReturn {
  const { data: session, status } = useSession();
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Check if JWT token is expired
  const checkTokenValidity = useCallback(() => {
    if (!session?.accessToken) {
      setIsTokenValid(false);
      return false;
    }

    try {
      // Parse JWT token to check expiration
      const tokenParts = session.accessToken.split(".");
      if (tokenParts.length !== 3) {
        setIsTokenValid(false);
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        setIsTokenValid(false);
        return false;
      }

      setIsTokenValid(true);
      return true;
    } catch (error) {
      console.error("Error parsing JWT token:", error);
      setIsTokenValid(false);
      return false;
    }
  }, [session?.accessToken]);

  // Handle authentication errors
  const handleAuthError = useCallback(async () => {
    toast({
      title: "Sesión Expirada",
      description:
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      variant: "destructive",
    });

    // Clear session data
    localStorage.removeItem("userInteractions");
    sessionStorage.clear();

    // Sign out and redirect
    await signOut({ redirect: false });
    window.location.href = "/login";
  }, []);

  // Check token validity on session change
  useEffect(() => {
    if (status === "authenticated" && session) {
      const isValid = checkTokenValidity();
      if (!isValid) {
        handleAuthError();
      }
    }
  }, [session, status, checkTokenValidity, handleAuthError]);

  // Set up periodic token validation
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(
        () => {
          const isValid = checkTokenValidity();
          if (!isValid) {
            handleAuthError();
          }
        },
        // 🧪 TESTING: Change to 10 * 1000 for 10-second testing
        5 * 60 * 1000
      ); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [status, checkTokenValidity, handleAuthError]);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated" && isTokenValid,
    isTokenValid,
    checkTokenValidity,
    handleAuthError,
  };
}
