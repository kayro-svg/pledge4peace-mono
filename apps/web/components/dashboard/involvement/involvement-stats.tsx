"use client";

import { MessageSquare, ThumbsDown, ThumbsUp, Vote } from "lucide-react";
import { useState } from "react";
import { InvolvementStatsCard } from "./involvement-stats-card";
import { useUserStats } from "@/hooks/useUserInvolvement";

interface InvolvementStatsProps {
  setShowAllVotes: (showAllVotes: boolean) => void;
  setShowAllComments: (showAllComments: boolean) => void;
  setShowAllUpvotes: (showAllUpvotes: boolean) => void;
  setShowAllDownvotes: (showAllDownvotes: boolean) => void;
  resetAllFilters: () => void;
}

export function InvolvementStats({
  setShowAllVotes,
  setShowAllComments,
  setShowAllUpvotes,
  setShowAllDownvotes,
  resetAllFilters,
}: InvolvementStatsProps) {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const {
    stats,
    isStatsLoading: isLoading,
    statsError: error,
    refetchStats,
  } = useUserStats();

  const getStatsInfo = () => {
    if (!stats) return [];

    return [
      {
        type: "total-votes",
        title: "Total Votes",
        value: stats.totalVotes.toString(),
        change:
          stats.monthlyVotes > 0
            ? `${stats.monthlyVotes}+ this month`
            : "No votes this month",
        icon: <Vote className="w-6 h-6 text-emerald-600" />,
        color: "emerald",
        setShowAllVotes,
      },
      {
        type: "total-upvotes",
        title: "Total Upvotes",
        value: stats.totalLikes.toString(),
        change:
          stats.totalVotes > 0
            ? `${Math.round((stats.totalLikes / stats.totalVotes) * 100)}% of your total votes`
            : "No upvotes yet",
        icon: <ThumbsUp className="w-6 h-6 text-blue-600" />,
        color: "blue",
        setShowAllUpvotes,
      },
      {
        type: "total-downvotes",
        title: "Total Downvotes",
        value: stats.totalDislikes.toString(),
        change:
          stats.totalVotes > 0
            ? `${Math.round((stats.totalDislikes / stats.totalVotes) * 100)}% of your total votes`
            : "No downvotes yet",
        icon: <ThumbsDown className="w-6 h-6 text-red-600" />,
        color: "red",
        setShowAllDownvotes,
      },
      {
        type: "total-comments",
        title: "Total Comments",
        value: stats.totalComments.toString(),
        change:
          stats.monthlyComments > 0
            ? `${stats.monthlyComments}+ this month`
            : "No comments this month",
        icon: <MessageSquare className="w-6 h-6 text-cyan-600" />,
        color: "cyan",
        setShowAllComments,
      },
    ];
  };

  const handleCardClick = (type: string) => {
    // Si ya está activo, desactivarlo
    if (type === activeCard) {
      setActiveCard(null);
      resetAllFilters();
      return;
    }

    // Si no está activo, activarlo y desactivar los demás
    setActiveCard(type);

    // Resetear todos los filtros primero
    resetAllFilters();

    // Activar solo el filtro seleccionado
    switch (type) {
      case "total-votes":
        setShowAllVotes(true);
        break;
      case "total-comments":
        setShowAllComments(true);
        break;
      case "total-upvotes":
        setShowAllUpvotes(true);
        break;
      case "total-downvotes":
        setShowAllDownvotes(true);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-96 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Your Involvement Summary
        </h1>
        <p className="text-slate-500 mb-4">
          Summary of your votes, comments and involvement in solutions per
          campaign
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading statistics: {error}</p>
          <button
            onClick={refetchStats}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const statsInfo = getStatsInfo();

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
        {statsInfo.map((stat) => (
          <InvolvementStatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color as "emerald" | "blue" | "red" | "purple"}
            isActive={activeCard === stat.type}
            onClick={() => handleCardClick(stat.type)}
          />
        ))}
      </div>
    </>
  );
}
