"use client";

import { useState, useEffect, useCallback } from "react";
import CommentItem from "./comment-item";
import CommentForm from "./comment-form";
import { useInteractionManager } from "../shared/use-interaction-manager";
import Image from "next/image";
import { getComments, createComment } from "@/lib/api/solutions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Comment } from "@/lib/types/index";
import AuthContainer from "@/components/login/auth-container";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils/logger";

interface CommentsSectionProps {
  solutionId?: string;
  onCommentAdded?: () => void;
}

export default function CommentsSection({
  solutionId,
  onCommentAdded,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { count, setCount, incrementCount } = useInteractionManager({
    solutionId: solutionId || "",
    initialCount: 0,
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Memoizamos la función para cargar comentarios para evitar recreaciones
  const fetchComments = useCallback(
    async (sid: string) => {
      if (!sid) return;

      setLoading(true);
      try {
        logger.log(`[Comments] Fetching comments for solution: ${sid}`);
        const fetchedComments = await getComments(sid);
        setComments(fetchedComments);

        // Solo actualizar el contador si es necesario, sin crear un bucle
        if (fetchedComments.length !== count) {
          setCount(fetchedComments.length);
        }
      } catch (error) {
        logger.error("[Comments] Error fetching comments:", error);
        // No mostrar toast en cada error para evitar spam de notificaciones
        if (!comments.length) {
          toast.error("Failed to load comments");
        }
      } finally {
        setLoading(false);
      }
    },
    [count, setCount, comments.length, setComments, setLoading]
  );

  // Cargar comentarios solo cuando cambia el solutionId
  useEffect(() => {
    if (solutionId) {
      fetchComments(solutionId);
    } else {
      setComments([]);
    }
  }, [solutionId, fetchComments]);

  const handleCommentSubmit = async (content: string, solutionId: string) => {
    if (!solutionId || !session) {
      toast.error("You must be logged in to comment");
      return;
    }

    try {
      const newComment = await createComment({
        content,
        solutionId,
        userName: session.user?.name || "Anonymous",
        userAvatar: session.user?.image || undefined,
      });

      setComments((prev) => [newComment, ...prev]);
      incrementCount();

      // Asegurar que el callback onCommentAdded se llame
      if (onCommentAdded) {
        onCommentAdded();
      }

      toast.success("Comment posted successfully");
    } catch (error) {
      toast.error("Failed to post comment");
      logger.error("Error posting comment:", error);
    }
  };

  if (!solutionId) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="w-full h-full flex justify-center items-center">
          <Image
            src="/comments_section.svg"
            alt="No solution selected"
            width={250}
            height={250}
          />
        </div>
      </div>
    );
  }

  return (
    <div id="comments-section" className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Comments</h3>
        <span className="text-sm text-gray-500">{count} comments</span>
      </div>

      {session ? (
        <CommentForm
          solutionId={solutionId}
          onSubmit={handleCommentSubmit}
          userAvatar={session.user?.image || undefined}
          userName={session.user?.name || "Anonymous"}
        />
      ) : (
        <div className="flex flex-col items-center py-2">
          <Button
            variant="outline"
            className="text-sm text-[#548281] border-[#548281] hover:bg-[#2F4858] hover:text-white"
            onClick={() => setShowLoginModal(true)}
          >
            Please sign in to comment
          </Button>
          <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
            <DialogContent className="max-w-lg w-full max-h-[100vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  <p className="text-lg font-semibold mb-4 text-center">
                    To comment you must login
                  </p>
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center">
                <AuthContainer
                  onLoginSuccess={() => setShowLoginModal(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="space-y-1 mt-4">
        {loading ? (
          <p className="text-center text-gray-500 py-4">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              author={{
                id: comment.userId,
                name: comment.userName,
                avatar: comment.userAvatar || undefined,
              }}
              content={comment.content}
              createdAt={new Date(comment.createdAt)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-full flex justify-center items-center">
              <Image
                src="/comments_section.svg"
                alt="No comments"
                width={250}
                height={250}
              />
            </div>
            <p className="text-center text-gray-500 py-4">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
