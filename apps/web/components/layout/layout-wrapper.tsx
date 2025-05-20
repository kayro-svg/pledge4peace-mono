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
    <>
      {showHeaderFooter && <SiteHeader />}
      {children}
      {showHeaderFooter && <SiteFooter />}
    </>
  );
}
