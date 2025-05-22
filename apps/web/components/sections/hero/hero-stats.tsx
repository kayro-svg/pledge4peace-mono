"use client";

import { StatCard } from "@/components/ui/stat-card";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumbers";
import { HeroStat } from "@/lib/types";
export default function HeroStats({ stats }: { stats: HeroStat[] }) {
  const counts = stats.map((stat) =>
    useAnimatedNumber(parseInt(stat.value.replace(/,/g, "")))
  );
  // Format the number with commas
  const formattedCount = counts.map((count) => count.toLocaleString());

  return (
    <div className="grid grid-cols-3 max-w-xl">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          count={formattedCount[index]}
          label={stat.label}
        />
      ))}
    </div>
  );
}
