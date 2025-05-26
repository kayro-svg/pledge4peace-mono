"use client";

import { Button } from "@/components/ui/button";
import { likeSolution, unlikeSolution } from "@/lib/api/solutions";
import { useInteractions } from "../shared/interaction-context";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface SolutionActionsBarProps {
  solutionId: string;
}

export default function SolutionActionsBar({
  solutionId,
}: SolutionActionsBarProps) {
  const { data: session } = useSession();
  const { handleInteraction, getInteractionCount, getUserInteraction } =
    useInteractions();

  const likeCount = getInteractionCount("like", solutionId);
  const commentCount = getInteractionCount("comment", solutionId);
  const hasLiked = getUserInteraction("like", solutionId);

  const handleLike = async () => {
    if (!session) {
      toast.error("Please sign in to like solutions");
      return;
    }

    try {
      if (hasLiked) {
        await unlikeSolution(solutionId);
        await handleInteraction("like", solutionId, likeCount - 1);
      } else {
        await likeSolution(solutionId);
        await handleInteraction("like", solutionId, likeCount + 1);
      }
    } catch (error) {
      toast.error(hasLiked ? "Failed to unlike" : "Failed to like");
      console.error("Error handling like:", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Check out this solution on Pledge4Peace",
        url: window.location.href,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share");
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 ${
            hasLiked ? "text-red-500" : "text-gray-500"
          } hover:text-red-500`}
          onClick={handleLike}
        >
          <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-500"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{commentCount}</span>
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500"
        onClick={handleShare}
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
