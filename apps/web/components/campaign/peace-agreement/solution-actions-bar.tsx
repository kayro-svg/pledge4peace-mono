"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  likeSolution,
  dislikeSolution,
  getSolutionStats,
} from "@/lib/api/solutions";
import { useInteractions } from "../shared/interaction-context";
import { Heart, MessageCircle, Share2, ThumbsDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import AuthContainer from "@/components/login/auth-container";

interface SolutionActionsBarProps {
  solutionId: string;
  commentCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  shareCount?: number;
  onCommentAdded?: () => void;
}

export default function SolutionActionsBar({
  solutionId,
  commentCount = 0,
  likeCount = 0,
  dislikeCount = 0,
  shareCount = 0,
  onCommentAdded,
}: SolutionActionsBarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { getUserInteraction, setUserInteraction } = useInteractions();
  const [likes, setLikes] = useState(likeCount);
  const [dislikes, setDislikes] = useState(dislikeCount);
  const [shares, setShares] = useState(shareCount);
  const [comments, setComments] = useState(commentCount);
  const hasLiked = getUserInteraction("like", solutionId);
  const hasDisliked = getUserInteraction("dislike", solutionId);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Refrescar stats cada 5 minutos
  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          const stats = await getSolutionStats(solutionId);
          setLikes(stats.likes);
          setDislikes(stats.dislikes);
          setShares(stats.shares);
        } catch (e) {
          // Silenciar errores
        }
      },
      5 * 60 * 1000
    ); // 5 minutos
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
      console.error("Error handling like:", error);
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
    } catch (error) {
      toast.error("Failed to update dislike");
      console.error("Error handling dislike:", error);
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
      }
      console.error("Error sharing:", error);
    }
  };

  // Callback para incrementar el contador de comentarios
  const handleCommentAdded = () => {
    setComments((prev) => prev + 1);
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${
              hasLiked ? "text-green-500" : "text-gray-500"
            } hover:text-red-500`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
            <span>{likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${
              hasDisliked ? "text-red-500" : "text-gray-500"
            } hover:text-red-500`}
            onClick={handleDislike}
          >
            <ThumbsDown
              className={`h-5 w-5 ${hasDisliked ? "fill-current" : ""}`}
            />
            <span>{dislikes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-500"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{comments}</span>
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
