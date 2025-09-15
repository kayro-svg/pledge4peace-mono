"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";

interface DashboardSessionContextType {
  session: any;
  status: "loading" | "authenticated" | "unauthenticated";
  isAuthenticated: boolean;
  isTokenValid: boolean;
  checkTokenValidity: () => boolean;
  handleAuthError: () => Promise<void>;
}

const DashboardSessionContext =
  createContext<DashboardSessionContextType | null>(null);

export function DashboardSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const authSession = useAuthSession();

  // No need for apiClient sync here - it's handled globally now

  return (
    <DashboardSessionContext.Provider value={authSession}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  const context = useContext(DashboardSessionContext);
  if (!context) {
    throw new Error(
      "useDashboardSession must be used within DashboardSessionProvider"
    );
  }
  return context;
}
