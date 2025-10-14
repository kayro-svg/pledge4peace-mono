"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  DashboardSessionProvider,
  useDashboardSession,
} from "@/contexts/dashboard-session-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const projectId = process.env.NEXT_PUBLIC_CLARITY_ID || "";

Clarity.init(projectId || "");

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { status } = useDashboardSession();

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  // Show loading while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281]"></div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" collapsible="icon" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardSessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardSessionProvider>
  );
}
