"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";
import { signOut } from "next-auth/react";

export function SessionExpiryWarning() {
  const { session, isAuthenticated, checkTokenValidity } = useAuthSession();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated || !session?.backendTokenExpires) return;

    const checkExpiry = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = session.backendTokenExpires;
      const timeLeft = expiryTime - currentTime;

      // Show warning if less than 10 minutes remaining
      const warningThreshold = 10 * 60; // 10 minutes in seconds

      if (timeLeft <= warningThreshold && timeLeft > 0) {
        setShowWarning(true);
        setTimeRemaining(timeLeft);
      } else if (timeLeft <= 0) {
        // Token expired
        setShowWarning(false);
        signOut({ redirect: false });
        window.location.href = "/login";
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, session?.backendTokenExpires]);

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleExtendSession = () => {
    // Refresh the page to trigger a new session validation
    window.location.reload();
  };

  const handleLogout = () => {
    signOut({ redirect: false });
    window.location.href = "/login";
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
        <Clock className="h-4 w-4" />
        <AlertTitle className="text-orange-800 dark:text-orange-200">
          Your session is about to expire
        </AlertTitle>
        <AlertDescription className="text-orange-700 dark:text-orange-300">
          Your session will expire in {formatTimeRemaining(timeRemaining)}. Do
          you want to continue?
        </AlertDescription>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExtendSession}
            className="bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Continue
          </Button>
          <Button size="sm" variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Alert>
    </div>
  );
}
