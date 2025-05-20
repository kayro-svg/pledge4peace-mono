import UserMetaCard from "@/components/dashboard/user-profile/user-meta-card";
import UserInfoCard from "@/components/dashboard/user-profile/user-info-card";
import UserAddressCard from "@/components/dashboard/user-profile/user-address-card";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:py-6">
        <div className="flex flex-col gap-4">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}
