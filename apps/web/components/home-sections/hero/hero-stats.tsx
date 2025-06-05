"use client";

import { StatCard } from "@/components/ui/stat-card";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumbers";
import { HeroStat } from "@/lib/types";

interface HeroStatsProps {
  stats: HeroStat[];
}

export default function HeroStats({ stats }: HeroStatsProps) {
  // Pre-process the values to ensure they're numbers
  const values = stats.map((stat) => {
    // Remove all non-numeric characters and parse as integer
    return parseInt(stat.value.replace(/[^0-9]/g, "")) || 0;
  });

  // Use the animated number hook for each value
  const animatedValues = values.map((value) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAnimatedNumber(value);
  });

  // Format the numbers with commas
  const formattedCounts = animatedValues.map((count) => count.toLocaleString());

  return (
    // <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 w-full max-w-xl">
    <div className="grid grid-cols-2 gap-4 w-full max-w-[400px] md:max-w-[500px] lg:max-w-[400px]">
      {stats.map((stat, index) => (
        <StatCard
          key={`${stat.label}-${index}`}
          icon={stat.icon}
          count={formattedCounts[index]}
          label={stat.label}
          className="text-center p-2 sm:p-4"
        />
      ))}
    </div>
  );
}
