"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  likeSolution,
  dislikeSolution,
  shareSolution,
  getSolutionStats,
} from "@/lib/api/solutions";
import { useInteractions } from "../shared/interaction-context";
import { Heart, MessageCircle, Share2, ThumbsDownIcon } from "lucide-react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import AuthContainer from "@/components/login/auth-container";
import { logger } from "@/lib/utils/logger";

interface SolutionActionsBarProps {
  solutionId: string;
  commentCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  shareCount?: number;
  onCommentAdded?: () => void;
  onCommentClick?: (e: React.MouseEvent) => void;
  onInteraction?: (
    solutionId: string,
    interactionType: "like" | "dislike" | "comment" | "share"
  ) => void;
  solutionToShare?: string;
}

export default function SolutionActionsBar({
  solutionId,
  commentCount = 0,
  likeCount = 0,
  dislikeCount = 0,
  shareCount = 0,
  onCommentAdded,
  onCommentClick,
  onInteraction,
  solutionToShare,
}: SolutionActionsBarProps) {
  const { session, isAuthenticated } = useAuthSession();
  const router = useRouter();
  const {
    getUserInteraction,
    setUserInteraction,
    handleInteraction,
    updateInteraction,
    syncUserInteraction,
  } = useInteractions();
  const [likes, setLikes] = useState(likeCount);
  const [dislikes, setDislikes] = useState(dislikeCount);
  const [shares, setShares] = useState(shareCount);
  const [comments, setComments] = useState(commentCount);
  const [isSharing, setIsSharing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Get interaction states from context
  const hasLiked = getUserInteraction("like", solutionId);
  const hasDisliked = getUserInteraction("dislike", solutionId);
  const hasCommented = getUserInteraction("comment", solutionId);
  const hasShared = getUserInteraction("share", solutionId);

  // Sync local state with props when solution changes
  useEffect(() => {
    setLikes(likeCount);
    setDislikes(dislikeCount);
    setShares(shareCount);
    setComments(commentCount);
  }, [solutionId, likeCount, dislikeCount, shareCount, commentCount]);

  // Sync comment count with parent component
  useEffect(() => {
    // Only update if the comment count has actually changed significantly
    // This prevents conflicts with optimistic updates
    if (Math.abs(comments - commentCount) > 1) {
      setComments(commentCount);
    }
  }, [commentCount]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like solutions");
      setShowLoginModal(true);
      return;
    }

    const wasLiked = hasLiked;
    const wasDisliked = hasDisliked;

    try {
      // Calculate new counts
      const newLikeCount = wasLiked ? Math.max(likes - 1, 0) : likes + 1;
      const newDislikeCount =
        wasDisliked && !wasLiked ? Math.max(dislikes - 1, 0) : dislikes;

      // Optimistic update - update local state first
      setLikes(newLikeCount);
      if (wasDisliked && !wasLiked) {
        setDislikes(newDislikeCount);
      }

      // Update interaction context with both count and user interaction state
      updateInteraction("like", solutionId, newLikeCount, !wasLiked);
      if (wasDisliked && !wasLiked) {
        updateInteraction("dislike", solutionId, newDislikeCount, false);
      }

      // Make API call
      await likeSolution(solutionId);

      toast.success(wasLiked ? "Like removed" : "Solution liked!");
    } catch (error) {
      // Revert optimistic update on error
      setLikes(likes);
      if (wasDisliked && !wasLiked) {
        setDislikes(dislikes);
      }

      // Revert context state
      updateInteraction("like", solutionId, likes, wasLiked);
      if (wasDisliked && !wasLiked) {
        updateInteraction("dislike", solutionId, dislikes, wasDisliked);
      }

      toast.error("Failed to update like");
      logger.error("Error handling like:", error);
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to dislike solutions");
      setShowLoginModal(true);
      return;
    }

    const wasDisliked = hasDisliked;
    const wasLiked = hasLiked;

    try {
      // Calculate new counts
      const newDislikeCount = wasDisliked
        ? Math.max(dislikes - 1, 0)
        : dislikes + 1;
      const newLikeCount =
        wasLiked && !wasDisliked ? Math.max(likes - 1, 0) : likes;

      // Optimistic update - update local state first
      setDislikes(newDislikeCount);
      if (wasLiked && !wasDisliked) {
        setLikes(newLikeCount);
      }

      // Update interaction context with both count and user interaction state
      updateInteraction("dislike", solutionId, newDislikeCount, !wasDisliked);
      if (wasLiked && !wasDisliked) {
        updateInteraction("like", solutionId, newLikeCount, false);
      }

      // Make API call
      await dislikeSolution(solutionId);

      toast.success(wasDisliked ? "Dislike removed" : "Solution disliked!");
      onInteraction?.(solutionId, "dislike");
    } catch (error) {
      // Revert optimistic update on error
      setDislikes(dislikes);
      if (wasLiked && !wasDisliked) {
        setLikes(likes);
      }

      // Revert context state
      updateInteraction("dislike", solutionId, dislikes, wasDisliked);
      if (wasLiked && !wasDisliked) {
        updateInteraction("like", solutionId, likes, wasLiked);
      }

      toast.error("Failed to update dislike");
      logger.error("Error handling dislike:", error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to share solutions");
      setShowLoginModal(true);
      return;
    }

    if (isSharing) return;

    setIsSharing(true);

    try {
      // First, update the share count on the server
      await shareSolution(solutionId);

      // Update the local state and mark as shared
      if (!hasShared) {
        setShares((prev) => prev + 1);
        setUserInteraction("share", solutionId, true);
      }

      // Always notify parent component about the share interaction
      // This ensures the solution is selected even if it was already shared
      onInteraction?.(solutionId, "share");

      // Use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: "Check out this solution on Pledge4Peace",
          text: `"${solutionToShare}" - See more solutions on Pledge4Peace`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast.success(
          hasShared
            ? "Link copied to clipboard again!"
            : "Link copied to clipboard!"
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        logger.error("Error sharing:", error);
        // Only show error if we didn't already update the share count
        if (!navigator.share && !hasShared) {
          toast.error("Failed to share. Please try again.");
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle comment button click
  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Notify parent component about the interaction first
    // This ensures the solution is selected before any other actions
    onInteraction?.(solutionId, "comment");

    // Call the parent's onCommentClick if provided
    if (onCommentClick) {
      onCommentClick(e);
    }

    // If user is not logged in, show login modal
    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      if (window.innerWidth > 1024) {
        setShowLoginModal(true);
      }
      return;
    }

    // Scroll to and focus the comment input after a small delay
    // to allow for the solution to expand first
    setTimeout(() => {
      const commentSection = document.getElementById("comments-section");
      if (commentSection) {
        const commentInput = commentSection.querySelector("textarea");
        if (commentInput) {
          (commentInput as HTMLTextAreaElement).focus();
        }
      }
    }, 300);
  };

  return (
    <>
      <div className="grid grid-cols-4 items-center justify-evenly bg-gray-50 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 p-5 rounded-none transition-all duration-200 ${
            hasLiked ? "text-green-500 bg-green-50" : "text-gray-500"
          } hover:text-green-500 hover:bg-green-50`}
          onClick={handleLike}
        >
          <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
          <span>{likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 p-5 rounded-none transition-all duration-200 ${
            hasDisliked ? "text-red-500 bg-red-50" : "text-gray-500"
          } hover:text-red-500 hover:bg-red-50`}
          onClick={handleDislike}
        >
          <ThumbsDownIcon
            className={`h-5 w-5 ${hasDisliked ? "fill-current" : ""}`}
          />
          <span>{dislikes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`group flex items-center justify-center gap-2 p-5 w-full rounded-none transition-all duration-200 ${
            hasCommented
              ? "text-blue-500 bg-blue-50 hover:bg-blue-50 hover:text-blue-500"
              : "text-gray-500 hover:bg-blue-50 hover:text-blue-500"
          }`}
          onClick={handleCommentClick}
        >
          <div className="relative">
            <MessageCircle
              className={`h-5 w-5 group-hover:scale-110 transition-transform duration-200 ${hasCommented ? "fill-current scale-110" : "group-hover:scale-110"}`}
            />
          </div>
          <span
            className={`transition-all duration-200 ${hasCommented ? "font-semibold" : "font-medium"}`}
          >
            {comments}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 p-5 rounded-none transition-all duration-200 ${
            hasShared
              ? "text-orange-500 bg-orange-50 hover:bg-orange-100"
              : "text-gray-500 hover:bg-orange-50 hover:text-orange-500"
          } ${isSharing ? "opacity-70" : ""}`}
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 className={`h-5 w-5 ${hasShared ? "fill-current" : ""}`} />
          <span>{shares}</span>
        </Button>
      </div>
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-lg w-full max-h-[100vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <p className="text-lg font-semibold mb-4 text-center">
                To interact with this solution you must login
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <AuthContainer
              onLoginSuccess={() => {
                setShowLoginModal(false);
              }}
              isModal
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
