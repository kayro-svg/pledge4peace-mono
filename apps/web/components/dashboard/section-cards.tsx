import { UserStats } from "@/lib/api/user-involvement";
import { StatsDashboardCard } from "./stats-dashboard-card";

export function SectionCards({
  stats,
  campaignsSupportedQty,
  isLoading,
  error,
}: {
  stats: UserStats | null;
  campaignsSupportedQty: number;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6">
      <StatsDashboardCard
        title="Total Campaigns Supported"
        value={campaignsSupportedQty}
        percentage={12}
        description={
          campaignsSupportedQty > 0
            ? `You've supported different campaigns across the world. Check out the campaigns you've supported.`
            : "You haven't supported any campaigns yet. Check out the campaigns and start supporting them."
        }
        buttonText="View campaigns"
        buttonLink={
          campaignsSupportedQty > 0 ? "/dashboard/pledges" : "/campaigns"
        }
        variant="campaigns"
        cardType="involvement"
      />

      <StatsDashboardCard
        title="Total Pledged"
        value={stats?.totalPledges || 0}
        percentage={12}
        description={
          stats?.totalPledges && stats.totalPledges > 0
            ? "You've pledged to support different campaigns across the world. Check out the activity you've done."
            : "You haven't pledged to any campaigns yet. Check out the campaigns and start pledging."
        }
        buttonText={
          stats?.totalPledges && stats.totalPledges > 0
            ? "View activity"
            : "View campaigns"
        }
        buttonLink={
          stats?.totalPledges && stats.totalPledges > 0
            ? "/dashboard/involvement"
            : "/campaigns"
        }
        variant="pledges"
        cardType="involvement"
      />

      <StatsDashboardCard
        title="Total Votes"
        value={stats?.totalVotes || 0}
        percentage={12}
        description={
          stats?.totalVotes && stats.totalVotes > 0
            ? "You've voted for different campaigns across the world. Check out the activity you've done."
            : "You haven't voted for any campaigns yet. Check out the campaigns and start voting."
        }
        buttonText="View activity"
        buttonLink={
          stats?.totalVotes && stats.totalVotes > 0
            ? "/dashboard/involvement"
            : "/campaigns"
        }
        variant="votes"
        cardType="involvement"
      />
    </div>
  );
}
