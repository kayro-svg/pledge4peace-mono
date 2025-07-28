// Ejemplo de componente HeaderUser adaptado al estilo minimalista
"use client";

import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboardIcon, LogOut, UserIcon } from "lucide-react";
import { clearAllUserInteractions } from "@/lib/utils/interaction-utils";
import { useRouter } from "next/navigation";

interface HeaderUserProps {
  user: User | null | undefined;
}

export function HeaderUserMobile({ user }: HeaderUserProps) {
  const router = useRouter();
  const handleSignOut = () => {
    // Clear all user-specific data from sessionStorage
    clearAllUserInteractions();

    signOut({ callbackUrl: "/" });
  };

  // Fallback if user is undefined or null
  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="hidden sm:block space-y-1">
          <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-32 h-3 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-between space-y-3">
      <div className="flex items-center space-x-3 mb-2">
        <Avatar className="h-10 w-10 border border-gray-200">
          <AvatarImage src={user.image || ""} alt={user.name || "User"} />
          <AvatarFallback className="bg-[#548281] text-white text-sm font-medium">
            {user.name?.charAt(0)?.toUpperCase() || (
              <UserIcon className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-[#2F4858] truncate text-base">
            {user.name || "User"}
          </p>
          <p className="text-base text-[#698D8B] truncate">
            {user.email || ""}
          </p>
        </div>
      </div>
      {/* 
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard")}
        className="text-[#698D8B] hover:text-[#2F4858] hover:bg-gray-50 font-light text-base"
      >
        <LayoutDashboardIcon className="h-4 w-4 mr-2" />
        <span className="inline"> Dashboard</span>
      </Button> */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-[#698D8B] hover:text-[#2F4858] hover:bg-gray-50 font-light text-base"
      >
        <LogOut className="h-4 w-4 mr-2" />
        <span className="inline">Sign out</span>
      </Button>
    </div>
  );
}
