"use client";

import {
  ArrowUpCircleIcon,
  HandshakeIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MessageSquareHeartIcon,
  FileCodeIcon,
  ScanEye,
  Shield,
  LucideIcon,
} from "lucide-react";
import * as React from "react";

import { NavMain, NavItem } from "@/components/dashboard/nav-main";
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
import { useState, useEffect } from "react";
import { getUserCompany } from "@/lib/api/peace-seal";

const data: {
  user: { name: string; email: string; avatar: string };
  navMain: NavItem[];
  navSecondary: { title: string; url: string; icon: LucideIcon }[];
} = {
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
      type: "privileged" as const, // Moderators/Admins/SuperAdmin
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: FileCodeIcon,
      type: "privileged" as const,
    },
    {
      title: "Manage Roles",
      url: "/dashboard/roles",
      icon: LayoutDashboardIcon,
      type: "adminOnly" as const,
    },
    {
      title: "Peace Seal - Advisors",
      url: "/dashboard/peace-seal",
      icon: Shield,
      type: "advisorOnly" as const, // Advisors/Admins/SuperAdmin
    },
    // Peace seal for companies
    {
      title: "Peace Seal",
      url: "/dashboard/company-peace-seal",
      icon: Shield,
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
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);

  // Check if user has a company associated
  useEffect(() => {
    async function checkUserCompany() {
      if (session?.user?.role !== "user") {
        setHasCompany(false);
        return;
      }

      try {
        await getUserCompany();
        setHasCompany(true);
      } catch {
        setHasCompany(false);
      }
    }

    if (session) {
      checkUserCompany();
    }
  }, [session]);

  // Filter navigation items based on user role and company status
  const filteredNavItems = data.navMain.filter((item) => {
    // Show Peace Seal for companies only if they have a company
    if (item.url === "/dashboard/company-peace-seal") {
      return session?.user?.role === "user" && hasCompany === true;
    }

    // Handle other role-based filtering
    if (item.type === "privileged") {
      return ["moderator", "admin", "superAdmin"].includes(
        session?.user?.role || ""
      );
    }
    if (item.type === "adminOnly") {
      return ["admin", "superAdmin"].includes(session?.user?.role || "");
    }
    if (item.type === "advisorOnly") {
      return ["advisor", "admin", "superAdmin"].includes(
        session?.user?.role || ""
      );
    }

    return true;
  });

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
        <NavMain items={filteredNavItems} />
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
