"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={30 * 60} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
