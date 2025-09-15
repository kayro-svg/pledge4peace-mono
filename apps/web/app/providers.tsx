"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { useGlobalApiClientSync } from "@/hooks/use-api-client";

function ApiClientSyncProvider({ children }: { children: React.ReactNode }) {
  // Keep apiClient synchronized globally
  useGlobalApiClientSync();
  return <>{children}</>;
}

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={0} // Disable automatic refetching
      refetchOnWindowFocus={false} // Disable refetch on window focus
      refetchWhenOffline={false}
    >
      <ApiClientSyncProvider>{children}</ApiClientSyncProvider>
    </SessionProvider>
  );
}
