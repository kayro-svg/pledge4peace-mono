import { InvolvementStats } from "@/components/dashboard/involvement/involvement-stats";
import { ActivityHistory } from "@/components/dashboard/involvement/activity-history";
import { CommentariesHistory } from "@/components/dashboard/involvement/comentaries-history";

export default function Page() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6">
          <div className="px-4 lg:px-6">
            <InvolvementStats />
          </div>
        </div>
        <div className="flex flex-col gap-4 py-4 md:gap-6">
          <div className="px-4 lg:px-6">
            <ActivityHistory />
          </div>
        </div>
        <div className="flex flex-col gap-4 py-4 md:gap-6">
          <div className="px-4 lg:px-6">
            <CommentariesHistory />
          </div>
        </div>
      </div>
    </>
  );
}
