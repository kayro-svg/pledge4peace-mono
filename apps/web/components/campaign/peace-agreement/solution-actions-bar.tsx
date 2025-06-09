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
import { useSession } from "next-auth/react";
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
}: SolutionActionsBarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { getUserInteraction, setUserInteraction, handleInteraction } =
    useInteractions();
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

  // Sync comment count with parent component and check if user has commented
  useEffect(() => {
    // Only update if the comment count has actually changed
    if (comments !== commentCount) {
      setComments(commentCount);
    }

    // If there are comments and a user is logged in, check if they've commented
    // This would typically be an API call in a real app
    // For now, we'll just maintain the local state
  }, [commentCount, comments, session?.user?.id, solutionId]);

  // Refrescar stats cada 5 minutos
  useEffect(() => {
    const updateStats = async () => {
      try {
        const stats = await getSolutionStats(solutionId);
        setLikes(stats.likes);
        setDislikes(stats.dislikes);
        setShares(stats.shares || 0); // Ensure shares is a number
      } catch (e) {
        // Silenciar errores
      }
    };

    // Initial load
    updateStats();

    // Set up interval for refreshes
    const interval = setInterval(updateStats, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, [solutionId]);

  // Sincronizar estado local con props al cambiar solución
  useEffect(() => {
    setLikes(likeCount);
    setDislikes(dislikeCount);
    setShares(shareCount);
    setComments(commentCount);
  }, [likeCount, dislikeCount, shareCount, commentCount, solutionId]);

  const handleLike = async () => {
    if (!session) {
      toast.error("Please sign in to like solutions");
      setShowLoginModal(true);
      return;
    }
    try {
      if (hasLiked) {
        await likeSolution(solutionId);
        setLikes((prev) => Math.max(prev - 1, 0));
        setUserInteraction("like", solutionId, false);
      } else {
        await likeSolution(solutionId);
        setLikes((prev) => prev + 1);
        setUserInteraction("like", solutionId, true);
        if (hasDisliked) {
          setDislikes((prev) => Math.max(prev - 1, 0));
          setUserInteraction("dislike", solutionId, false);
        }
      }
    } catch (error) {
      toast.error("Failed to update like");
      logger.error("Error handling like:", error);
    }
  };

  const handleDislike = async () => {
    if (!session) {
      toast.error("Please sign in to dislike solutions");
      setShowLoginModal(true);
      return;
    }
    try {
      if (hasDisliked) {
        await dislikeSolution(solutionId);
        setDislikes((prev) => Math.max(prev - 1, 0));
        setUserInteraction("dislike", solutionId, false);
      } else {
        await dislikeSolution(solutionId);
        setDislikes((prev) => prev + 1);
        setUserInteraction("dislike", solutionId, true);
        if (hasLiked) {
          setLikes((prev) => Math.max(prev - 1, 0));
          setUserInteraction("like", solutionId, false);
        }
      }
      onInteraction?.(solutionId, "dislike");
    } catch (error) {
      toast.error("Failed to update dislike");
      logger.error("Error handling dislike:", error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session) {
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
          text: `"${solutionId}" - See more solutions on Pledge4Peace`,
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
    if (!session) {
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
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
