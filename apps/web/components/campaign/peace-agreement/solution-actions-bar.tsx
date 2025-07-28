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
    getInteractionCount,
    updateFromBackend,
    updateCommentCount,
  } = useInteractions();

  const [isSharing, setIsSharing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  // Get current state from context (with fallbacks to props)
  const currentLikes = getInteractionCount("like", solutionId) || likeCount;
  const currentDislikes =
    getInteractionCount("dislike", solutionId) || dislikeCount;
  const currentShares = getInteractionCount("share", solutionId) || shareCount;
  const currentComments =
    getInteractionCount("comment", solutionId) || commentCount;

  const hasLiked = getUserInteraction("like", solutionId);
  const hasDisliked = getUserInteraction("dislike", solutionId);
  const hasCommented = getUserInteraction("comment", solutionId);
  const hasShared = getUserInteraction("share", solutionId);

  // Sync comment count with parent - be more aggressive about syncing
  useEffect(() => {
    // Always sync if there's a significant difference or if context is empty
    if (
      commentCount !== currentComments &&
      commentCount > 0 // Only sync if we have actual data
    ) {
      updateCommentCount(solutionId, commentCount);
    }
  }, [commentCount, currentComments, solutionId, updateCommentCount]);

  // Also sync when the component mounts and we have comment data
  useEffect(() => {
    if (commentCount > 0 && currentComments === 0) {
      updateCommentCount(solutionId, commentCount);
    }
  }, [commentCount, currentComments, solutionId, updateCommentCount]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like solutions");
      setShowLoginModal(true);
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      // Call backend - it handles all the logic including mutual exclusivity
      const response = await likeSolution(solutionId);

      // Update context with backend response
      updateFromBackend(solutionId, response.stats, response.userInteractions);

      toast.success(response.liked ? "Solution liked!" : "Like removed");
      onInteraction?.(solutionId, "like");
    } catch (error) {
      toast.error("Failed to update like");
      logger.error("Error handling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to dislike solutions");
      setShowLoginModal(true);
      return;
    }

    if (isDisliking) return;
    setIsDisliking(true);

    try {
      // Call backend - it handles all the logic including mutual exclusivity
      const response = await dislikeSolution(solutionId);

      // Update context with backend response
      updateFromBackend(solutionId, response.stats, response.userInteractions);

      toast.success(
        response.disliked ? "Solution disliked!" : "Dislike removed"
      );
      onInteraction?.(solutionId, "dislike");
    } catch (error) {
      toast.error("Failed to update dislike");
      logger.error("Error handling dislike:", error);
    } finally {
      setIsDisliking(false);
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
      // Update share count on server
      await shareSolution(solutionId);

      // Update local state
      if (!hasShared) {
        updateFromBackend(
          solutionId,
          {
            likes: currentLikes,
            dislikes: currentDislikes,
            shares: currentShares + 1,
          },
          {
            hasLiked: hasLiked,
            hasDisliked: hasDisliked,
            hasShared: true,
          }
        );
      }

      onInteraction?.(solutionId, "share");

      // Handle sharing
      if (navigator.share) {
        await navigator.share({
          title: "Check out this solution on Pledge4Peace",
          text: `"${solutionToShare}" - See more solutions on Pledge4Peace`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        logger.error("Error sharing:", error);
        if (!navigator.share) {
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

    onInteraction?.(solutionId, "comment");

    if (onCommentClick) {
      onCommentClick(e);
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      if (window.innerWidth > 1024) {
        setShowLoginModal(true);
      }
      return;
    }

    // Focus comment input
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
          disabled={isLiking}
          className={`flex items-center gap-2 p-5 rounded-none transition-all duration-200 ${
            hasLiked ? "text-green-500 bg-green-50" : "text-gray-500"
          } hover:text-green-500 hover:bg-green-50`}
          onClick={handleLike}
        >
          <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
          <span>{currentLikes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isDisliking}
          className={`flex items-center gap-2 p-5 rounded-none transition-all duration-200 ${
            hasDisliked ? "text-red-500 bg-red-50" : "text-gray-500"
          } hover:text-red-500 hover:bg-red-50`}
          onClick={handleDislike}
        >
          <ThumbsDownIcon
            className={`h-5 w-5 ${hasDisliked ? "fill-current" : ""}`}
          />
          <span>{currentDislikes}</span>
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
            {currentComments}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isSharing}
          className={`flex items-center gap-2 p-5 rounded-none transition-all duration-200 ${
            hasShared ? "text-blue-500 bg-blue-50" : "text-gray-500"
          } hover:text-blue-500 hover:bg-blue-50`}
          onClick={handleShare}
        >
          <Share2 className={`h-5 w-5 ${hasShared ? "fill-current" : ""}`} />
          <span>{currentShares}</span>
        </Button>
      </div>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] md:h-[fit-content]">
          <DialogHeader>
            <DialogTitle>Sign in to interact</DialogTitle>
          </DialogHeader>
          <AuthContainer
            onLoginSuccess={() => {
              setShowLoginModal(false);
              toast.success("Welcome! You can now interact with solutions.");
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
