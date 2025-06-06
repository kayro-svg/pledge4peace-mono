"use client";

import React from "react";
import { usePathname } from "next/navigation";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noHeaderFooterRoutes = [
    "/login",
    "/signup",
    "/reset-password",
    "/dashboard",
    "/dashboard/pledges",
    "/dashboard/involvement",
    "/dashboard/profile",
  ];
  const showHeaderFooter = !noHeaderFooterRoutes.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {showHeaderFooter && <SiteHeader />}
      <main className="flex-1 w-full">
        {/* Container with responsive padding and max-width */}
        <div className="w-full px-0 md:px-4 md:pr-0 lg:px-0">{children}</div>
      </main>
      {showHeaderFooter && <SiteFooter />}
    </div>
  );
}
