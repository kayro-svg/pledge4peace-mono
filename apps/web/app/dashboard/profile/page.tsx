"use client";

import UserMetaCard from "@/components/dashboard/user-profile/user-meta-card";
import UserInfoCard from "@/components/dashboard/user-profile/user-info-card";
import UserAddressCard from "@/components/dashboard/user-profile/user-address-card";
import UserProfilePage from "@/components/dashboard/user-profile/user-profile-page";
import { useAuthSession } from "@/hooks/use-auth-session";
import { User } from "next-auth";

export default function Page() {
  const { session } = useAuthSession();
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:py-6">
        <div className="flex flex-col gap-4">
          <UserProfilePage user={session?.user as User} />
        </div>
      </div>
    </div>
  );
}
