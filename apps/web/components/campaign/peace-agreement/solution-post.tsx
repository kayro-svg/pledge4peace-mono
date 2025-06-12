"use client";

import { ChevronDown, TrendingUp, ChevronUp } from "lucide-react";
import SolutionActionsBar from "./solution-actions-bar";
import AdminActions from "@/components/admin/admin-actions";
import { Solution } from "@/lib/types/index";
import { useEffect } from "react";
import { useInteractionManager } from "../shared/use-interaction-manager";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { PartyConfig } from "./peace-agreement-content";
import { Badge } from "@/components/ui/badge";

interface SolutionPostProps {
  solution: Solution;
  activeSolutionId: string;
  onSolutionChange: (solutionId: string) => void;
  onCommentClick?: (solutionId: string | React.MouseEvent) => void;
  index: number;
  toggleExpand: (solutionId: string) => void;
  rank: number;
  onRefresh?: () => Promise<void>;
  showPartyBadge?: boolean;
  postPartyConfig?: PartyConfig;
}

type PartyId = "israeli" | "palestinian";

export default function SolutionPost({
  solution,
  activeSolutionId,
  onSolutionChange,
  onCommentClick,
  index,
  toggleExpand,
  rank,
  onRefresh,
  showPartyBadge,
  postPartyConfig,
}: SolutionPostProps) {
  const { count, setCount } = useInteractionManager({
    solutionId: solution.id,
    initialCount: 0,
  });

  // const postPartyConfig = {
  //   israeli: {
  //     label: "Israel",
  //     icon: <IsraelFlag width={20} height={16} />,
  //     color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-transparent",
  //   },
  //   palestinian: {
  //     label: "Palestine",
  //     icon: <PalestineFlag width={20} height={16} />,
  //     color: "bg-green-50 text-green-700 border-green-200 hover:bg-transparent",
  //   },
  // };

  // Hook para verificar permisos de administración
  const { canDelete } = useAdminPermissions();

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
    if (
      solution.stats?.comments !== undefined &&
      solution.stats.comments !== count
    ) {
      setCount(solution.stats.comments);
    }
  }, [solution.stats?.comments, count, setCount]);

  // Handle interaction from action bar (like, dislike, share, comment)
  const handleInteraction = (
    solutionId: string,
    interactionType: "like" | "dislike" | "comment" | "share"
  ) => {
    // If this solution is not the active one, make it active
    if (
      onSolutionChange &&
      solutionId === solution.id &&
      solutionId !== activeSolutionId
    ) {
      onSolutionChange(solutionId);
    }

    // Ensure the solution is expanded for comment interactions
    if (interactionType === "comment" && !solution.expanded) {
      toggleExpand(solutionId);
    }
  };

  return (
    <div
      className={`group border ${
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
      <div className="border-t p-3 md:p-6 border-gray-100 gap-3 flex flex-col">
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-4 md:mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <div className="text-sm text-gray-600">Ranked #{rank}</div>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón de administración - Solo visible si el usuario tiene permisos */}
              {canDelete(solution.userId) && (
                <AdminActions
                  type="solution"
                  resourceId={solution.id}
                  resourceOwnerId={solution.userId}
                  onDeleted={async () => {
                    // Usar la función de refresh si está disponible
                    if (onRefresh) {
                      await onRefresh();
                    } else {
                      // Como último recurso, refrescar la página
                      window.location.reload();
                    }
                  }}
                  className="md:opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
              {showPartyBadge && (
                <Badge
                  className={`${postPartyConfig?.[solution.partyId as PartyId].color} hover:bg-transparent`}
                >
                  <span className="mr-1">
                    {postPartyConfig?.[solution.partyId as PartyId].icon}
                  </span>
                  {postPartyConfig?.[solution.partyId as PartyId].label}
                </Badge>
              )}
            </div>
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
        onInteraction={handleInteraction}
        onCommentClick={(e: React.MouseEvent) => {
          e?.stopPropagation();
          // If onCommentClick is provided (mobile view), just call it with the solution ID
          // The interaction will be handled by the onInteraction callback
          if (onCommentClick) {
            onCommentClick(solution.id);
          } else if (onSolutionChange) {
            // For desktop view, ensure the solution is selected and expanded
            if (solution.id !== activeSolutionId) {
              onSolutionChange(solution.id);
            }
            if (!solution.expanded) {
              toggleExpand(solution.id);
            }
          }
        }}
      />
    </div>
  );
}
