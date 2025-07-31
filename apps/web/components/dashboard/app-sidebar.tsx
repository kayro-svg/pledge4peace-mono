"use client";

import {
  ArrowUpCircleIcon,
  HandshakeIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MessageSquareHeartIcon,
  FileCodeIcon,
  ScanEye,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NavUser } from "./nav-user";
import { User } from "next-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthSession } from "@/hooks/use-auth-session";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Pledges made",
      url: "/dashboard/pledges",
      icon: HandshakeIcon,
    },
    {
      title: "Involvement",
      url: "/dashboard/involvement",
      icon: MessageSquareHeartIcon,
    },
    {
      title: "Campaigns Solutions",
      url: "/dashboard/moderate-campaigns-solutions",
      icon: ScanEye,
      type: "superAdmin" as const, // This is a superAdmin item
    },
  ],
  // navClouds: [
  //   {
  //     title: "Capture",
  //     icon: CameraIcon,
  //     isActive: true,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Proposal",
  //     icon: FileTextIcon,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Prompts",
  //     icon: FileCodeIcon,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  // ],
  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: SettingsIcon,
    // },
    {
      title: "Get Help",
      url: "/contact",
      icon: HelpCircleIcon,
    },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: SearchIcon,
    // },
  ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: DatabaseIcon,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: ClipboardListIcon,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: FileIcon,
  //   },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { session } = useAuthSession();
  return (
    <Sidebar
      side={isMobile ? "right" : "left"}
      collapsible="icon"
      {...props}
      className="border-r bg-white md:bg-transparent"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              onClick={() => {
                router.push("/");
              }}
              tooltip="Home"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <Image
                  src="/pleadge4peace_header_logo.png"
                  alt="Pledge4Peace"
                  width={185}
                  height={185}
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      {isMobile && (
        <SidebarFooter>
          <SidebarMenuItem>
            <NavUser user={session?.user as User} />
          </SidebarMenuItem>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
