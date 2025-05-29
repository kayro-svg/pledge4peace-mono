"use client";

import { ChevronDown } from "lucide-react";
import { ChevronUp } from "lucide-react";
import SolutionActionsBar from "./solution-actions-bar";
import { Solution } from "@/lib/types/index";
import { useEffect } from "react";
import { useInteractions } from "../shared/interaction-context";
import { useInteractionManager } from "../shared/use-interaction-manager";

interface SolutionPostProps {
  solution: Solution;
  activeSolutionId: string;
  onSolutionChange: (solutionId: string) => void;
  index: number;
  toggleExpand: (solutionId: string) => void;
}

export default function SolutionPost({
  solution,
  activeSolutionId,
  onSolutionChange,
  index,
  toggleExpand,
}: SolutionPostProps) {
  const { count, setCount } =
    useInteractionManager({
      solutionId: solution.id,
      initialCount: 0,
    });

  useEffect(() => {
    if (solution.expanded) {
      setCount(solution.comments || 0);
    }
  }, [solution.expanded, solution.comments, solution.id, setCount]);

  // Callback to update comment count in the UI when a comment is added
  const handleCommentAdded = () => {
    // Increment the local comment count
    const newCount = count + 1;
    setCount(newCount);
    
    // Also update the counter in the solution object to keep it in sync
    if (solution.stats) {
      solution.stats.comments = newCount;
    }
  };
  
  // This effect ensures the comment count stays in sync with the solution data
  useEffect(() => {
    if (solution.stats?.comments !== undefined && solution.stats.comments !== count) {
      setCount(solution.stats.comments);
    }
  }, [solution.stats?.comments, count, setCount]);

  console.log("solution post", solution);

  return (
    <div
      className={`border ${
        solution.id === activeSolutionId
          ? "border-[#2F4858] ring-2 ring-[#2F4858]/20"
          : "border-gray-200"
      } hover:border-[#2F4858] hover:ring-2 hover:ring-[#2F4858]/20 rounded-2xl overflow-hidden bg-white transition-all`}
      onClick={() => {
        if (onSolutionChange && solution.id !== activeSolutionId) {
          onSolutionChange(solution.id);
        }
      }}
    >
      <div className="border-t p-6 border-gray-100 gap-3 flex flex-col">
        <div className="flex flex-col gap-0">
          <div className="flex items-start gap-2">
            <div className="bg-gray-100 p-1 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600"
              >
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-6" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">{solution.rank}</div>
          </div>

          <h4 className="text-lg font-semibold">{solution.title}</h4>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(solution.id);
          }}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          {solution.expanded ? (
            <>
              Read less <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </button>

        {solution.expanded && solution.description && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-700">{solution.description}</p>
          </div>
        )}
      </div>

      <SolutionActionsBar
        solutionId={solution.id}
        commentCount={solution.stats?.comments ?? 0}
        likeCount={solution.stats?.likes ?? 0}
        dislikeCount={solution.stats?.dislikes ?? 0}
        shareCount={solution.stats?.shares ?? 0}
        onCommentAdded={handleCommentAdded}
        onCommentClick={() => {
          // If this solution is not expanded, trigger the toggle to expand it
          if (!solution.expanded && onSolutionChange) {
            onSolutionChange(solution.id);
          }
        }}
      />
    </div>
  );
}
