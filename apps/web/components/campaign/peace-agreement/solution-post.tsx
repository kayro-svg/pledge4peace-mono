"use client";

import { ChevronDown, TrendingUp, ChevronUp } from "lucide-react";
import SolutionActionsBar from "./solution-actions-bar";
import AdminActions from "@/components/admin/admin-actions";
import { Solution } from "@/lib/types/index";
import { useEffect, useRef, useState } from "react";
import { useInteractions } from "../shared/interaction-context";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { PartyConfig } from "./peace-agreement-content";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSolution } from "@/lib/api/solutions";

interface SolutionPostProps {
  solution: Solution;
  activeSolutionId: string;
  onSolutionChange: (solutionId: string) => void;
  onCommentClick?: (solutionId: string | React.MouseEvent) => void;
  toggleExpand: (solutionId: string) => void;
  rank: number;
  onRefresh?: () => Promise<void>;
  showPartyBadge?: boolean;
  postPartyConfig?: PartyConfig;
}

// Tipo eliminado - ahora partyId es string genérico

export default function SolutionPost({
  solution,
  activeSolutionId,
  onSolutionChange,
  onCommentClick,
  toggleExpand,
  rank,
  onRefresh,
  showPartyBadge,
  postPartyConfig,
}: SolutionPostProps) {
  const { getInteractionCount, updateCommentCount } = useInteractions();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: solution.title,
    description: solution.description || "",
  });

  // Get comment count from context
  const commentCount = getInteractionCount("comment", solution.id);

  // Hook para verificar permisos de administración
  const { canEdit } = useAdminPermissions();

  // Callback to update comment count in the UI when a comment is added
  const handleCommentAdded = () => {
    // Increment the comment count in the context
    const newCount = commentCount + 1;
    updateCommentCount(solution.id, newCount);
  };

  // This effect ensures the comment count stays in sync with the solution data
  useEffect(() => {
    if (
      solution.stats?.comments !== undefined &&
      solution.stats.comments !== commentCount
    ) {
      updateCommentCount(solution.id, solution.stats.comments);
    }
  }, [solution.stats?.comments, commentCount, solution.id, updateCommentCount]);

  // If this solution becomes the active target, ensure it is scrolled into view from inside the card as a fallback
  useEffect(() => {
    if (!rootRef.current) return;
    if (solution.id !== activeSolutionId) return;
    // Only scroll if the element is not sufficiently in viewport
    const rect = rootRef.current.getBoundingClientRect();
    const buffer = 80; // header offset
    const inView = rect.top >= buffer && rect.bottom <= window.innerHeight;
    if (!inView) {
      rootRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeSolutionId, solution.id]);

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
      id={`solution-${solution.id}`}
      data-solution-id={solution.id}
      className={`solution-card group border ${
        solution.id === activeSolutionId
          ? "border-[#2F4858] ring-2 ring-[#2F4858]/20"
          : "border-gray-200"
      } hover:border-[#2F4858] hover:ring-2 hover:ring-[#2F4858]/20 rounded-2xl overflow-hidden bg-white transition-all`}
      ref={rootRef}
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
              {showPartyBadge && (
                <Badge
                  className={`${postPartyConfig?.[solution.partyId]?.color || ""} hover:bg-transparent`}
                >
                  <span className="mr-1">
                    {postPartyConfig?.[solution.partyId]?.icon}
                  </span>
                  {postPartyConfig?.[solution.partyId]?.label}
                </Badge>
              )}
              {/* Botón de administración - Solo visible si el usuario tiene permisos */}
              {canEdit() && (
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
                  onEditClick={() => {
                    setEditData({
                      title: solution.title,
                      description: solution.description || "",
                    });
                    setIsEditOpen(true);
                  }}
                  className="md:opacity-100 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
          </div>

          <h4 className="text-base font-semibold">{solution.title}</h4>
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
        solutionToShare={solution.title}
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Solution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editData.title}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editData.description}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, description: e.target.value }))
                }
                className="min-h-[150px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    await updateSolution(solution.id, {
                      title: editData.title,
                      description: editData.description,
                    });
                    toast.success("Solution updated");
                    setIsEditOpen(false);
                    // Best-effort UI refresh via provided callback
                    if (onRefresh) await onRefresh();
                  } catch {
                    toast.error("Failed to update solution");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={
                  isSaving ||
                  !editData.title.trim() ||
                  !editData.description.trim()
                }
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
