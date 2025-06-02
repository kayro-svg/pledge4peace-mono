import { HeartHandshake, ChartNoAxesCombined, Landmark } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export default function StatsSection() {
  const stats = [
    {
      icon: <HeartHandshake className="w-8 h-8 text-[#86AC9D]" />,
      value: "5000+",
      label: "Peace activists",
    },
    {
      icon: <ChartNoAxesCombined className="w-8 h-8 text-[#86AC9D]" />,
      value: "100,000+",
      label: "Pledges Made",
    },
    {
      icon: <Landmark className="w-8 h-8 text-[#86AC9D]" />,
      value: "100+",
      label: "Committed Political Parties",
    },
  ];

  return (
    <section className="py-16 container mx-auto px-6 ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            count={stat.value}
            label={stat.label}
          />
        ))}
      </div>
    </section>
  );
}
