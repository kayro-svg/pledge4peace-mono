"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Check every 5 minutes instead of 30
      refetchOnWindowFocus={true} // Enable refetch on window focus for better UX
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
