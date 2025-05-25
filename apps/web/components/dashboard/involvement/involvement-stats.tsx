"use client";

import { MessageSquare, ThumbsDown, ThumbsUp, Vote } from "lucide-react";
import { useState } from "react";
import { InvolvementStatsCard } from "./involvement-stats-card";

export function InvolvementStats() {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const involvementStatsInfo = [
    {
      type: "total-votes",
      title: "Total Votes",
      value: "100",
      change: "5+ this month",
      icon: <Vote className="w-6 h-6 text-emerald-600" />,
      color: "emerald",
    },
    {
      type: "total-upvotes",
      title: "Total Upvotes",
      value: "50",
      change: "50% of your total votes",
      icon: <ThumbsUp className="w-6 h-6 text-blue-600" />,
      color: "blue",
    },
    {
      type: "total-downvotes",
      title: "Total Downvotes",
      value: "50",
      change: "50% of your total votes",
      icon: <ThumbsDown className="w-6 h-6 text-orange-600" />,
      color: "orange",
    },
    {
      type: "total-comments",
      title: "Total Comments",
      value: "100",
      change: "10+ this month",
      icon: <MessageSquare className="w-6 h-6 text-cyan-600" />,
      color: "cyan",
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Your Involvement Summary
        </h1>
        <p className="text-slate-500">
          Summary of your votes, comments and involvement in solutions per
          campaign
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        {involvementStatsInfo.map((stat) => (
          <InvolvementStatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color as "emerald" | "blue" | "orange" | "purple"}
            isActive={activeCard === stat.type}
            onClick={() =>
              setActiveCard(stat.type === activeCard ? null : stat.type)
            }
          />
        ))}
      </div>
    </>
  );
}
