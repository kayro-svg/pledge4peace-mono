import { StatsDashboardCard } from "./stats-dashboard-card";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6">
      <StatsDashboardCard
        title="Total Campaigns Supported"
        value={1000}
        percentage={12}
        description="You've supported campaigns across 28 countries, focusing on education, health, and peace initiatives."
        buttonText="View campaigns"
        buttonLink="/dashboard/pledges"
        variant="campaigns"
        cardType="involvement"
      />

      <StatsDashboardCard
        title="Total Pledged"
        value={1000}
        percentage={12}
        description="You've pledged to support campaigns across 28 countries, focusing on education, health, and peace initiatives."
        buttonText="View pledges"
        buttonLink="/dashboard/pledges"
        variant="pledges"
        cardType="involvement"
      />

      <StatsDashboardCard
        title="Total Votes"
        value={1000}
        percentage={12}
        description="You've voted for campaigns across 28 countries, focusing on education, health, and peace initiatives."
        buttonText="View votes"
        buttonLink="/dashboard/involvement"
        variant="votes"
        cardType="involvement"
      />
    </div>
  );
}
