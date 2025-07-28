"use client";

import { LucideIcon } from "lucide-react";
import { useInteractions } from "./interaction-context";

interface InteractionCounterProps {
  icon: LucideIcon;
  type: "like" | "dislike" | "share" | "comment";
  solutionId: string;
  onClick?: () => void;
}

export default function InteractionCounter({
  icon: Icon,
  type,
  solutionId,
  onClick,
}: InteractionCounterProps) {
  const { getInteractionCount, getUserInteraction } = useInteractions();

  // Get current count and user interaction status
  const count = getInteractionCount(type, solutionId);
  const isActive = getUserInteraction(type, solutionId);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Format counter for display
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const hoverBgColor = isActive
    ? type === "like"
      ? "bg-green-50"
      : type === "dislike"
        ? "bg-red-50"
        : type === "comment"
          ? "bg-purple-50"
          : "bg-blue-50"
    : "bg-gray-50";

  return (
    <div
      className={`flex flex-row items-center justify-center gap-2 ${hoverBgColor} transition-colors`}
    >
      <button
        onClick={handleClick}
        className={`flex items-center justify-center py-3 transition-colors ${
          isActive
            ? type === "like"
              ? "text-green-500"
              : type === "dislike"
                ? "text-red-500"
                : type === "comment"
                  ? "text-purple-500"
                  : "text-blue-500"
            : "text-gray-400"
        } hover:text-gray-700`}
      >
        <Icon className="h-5 w-5" />
      </button>
      <p
        className={`text-xs ${
          isActive
            ? type === "like"
              ? "text-green-500"
              : type === "dislike"
                ? "text-red-500"
                : type === "comment"
                  ? "text-purple-500"
                  : "text-blue-500"
            : "text-gray-500"
        }`}
      >
        {formatCount(count)}
      </p>
    </div>
  );
}
