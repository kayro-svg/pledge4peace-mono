"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "@/components/dashboard/nav-user";
import { useAuthSession } from "@/hooks/use-auth-session";
import { User } from "next-auth";
import { NotificationsBell } from "./NotificationsBell";

export function SiteHeader() {
  const { session } = useAuthSession();
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex flex-row-reverse md:flex-row items-center justify-between md:justify-start w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium text-slate-800">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <NotificationsBell />
          <NavUser user={session?.user as User} />
        </div>
      </div>
    </header>
  );
}
