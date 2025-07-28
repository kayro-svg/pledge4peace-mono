"use client";

import { useState, useEffect, useCallback } from "react";
import CommentItem from "./comment-item";
import CommentForm from "./comment-form";
import Image from "next/image";
import { getComments, createComment } from "@/lib/api/solutions";
import { useAuthSession } from "@/hooks/use-auth-session";
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
import { useInteractions } from "../shared/interaction-context";

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
  const { session, isAuthenticated } = useAuthSession();
  const { getInteractionCount, updateCommentCount } = useInteractions();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Get current comment count from context
  const commentCount = getInteractionCount("comment", solutionId || "");

  // Function to count all comments including replies
  const getTotalCommentCount = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + getTotalCommentCount(comment.replies || []);
    }, 0);
  };

  // Function to recursively find and update a comment (including nested replies)
  const updateCommentInTree = (
    comments: Comment[],
    parentId: string,
    newReply: Comment
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        // Found the parent comment, add the reply
        return {
          ...comment,
          replies: [newReply, ...(comment.replies || [])],
        };
      } else if (comment.replies && comment.replies.length > 0) {
        // Recursively search in replies
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  // Function to recursively remove a comment from the tree
  const removeCommentFromTree = (
    comments: Comment[],
    commentId: string
  ): Comment[] => {
    return comments
      .filter((comment) => comment.id !== commentId)
      .map((comment) => ({
        ...comment,
        replies: removeCommentFromTree(comment.replies || [], commentId),
      }));
  };

  // Handle comment deletion
  const handleCommentDeleted = (commentId: string) => {
    const updatedComments = removeCommentFromTree(comments, commentId);
    setComments(updatedComments);

    // Update comment count in context
    if (solutionId) {
      const newTotalCount = getTotalCommentCount(updatedComments);
      updateCommentCount(solutionId, newTotalCount);
    }
  };

  // Memoizamos la función para cargar comentarios para evitar recreaciones
  const fetchComments = useCallback(
    async (sid: string) => {
      if (!sid) return;

      setLoading(true);
      try {
        logger.log(`[Comments] Fetching comments for solution: ${sid}`);
        const fetchedComments = await getComments(sid);
        setComments(fetchedComments);

        // Update comment count in context with total count including replies
        const totalCount = getTotalCommentCount(fetchedComments);
        updateCommentCount(sid, totalCount);
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
    [updateCommentCount, comments.length, setComments, setLoading]
  );

  // Cargar comentarios solo cuando cambia el solutionId
  useEffect(() => {
    if (solutionId) {
      fetchComments(solutionId);
    } else {
      setComments([]);
    }
  }, [solutionId, fetchComments]);

  const handleCommentSubmit = async (
    content: string,
    solutionId: string,
    parentId?: string
  ) => {
    if (!solutionId || !session) {
      toast.error("You must be logged in to comment");
      return;
    }

    try {
      const newComment = await createComment({
        content,
        solutionId,
        parentId,
        userName: session.user?.name || "Anonymous",
        userAvatar: session.user?.image || undefined,
      });

      let updatedComments: Comment[];

      if (parentId) {
        // If it's a reply, recursively find and update the parent comment
        updatedComments = updateCommentInTree(comments, parentId, newComment);
        setComments(updatedComments);
      } else {
        // If it's a top-level comment, add it to the main list
        updatedComments = [newComment, ...comments];
        setComments(updatedComments);
      }

      // Update comment count in context with the new total
      const newTotalCount = getTotalCommentCount(updatedComments);
      updateCommentCount(solutionId, newTotalCount);

      // Asegurar que el callback onCommentAdded se llame
      if (onCommentAdded) {
        onCommentAdded();
      }

      toast.success(
        parentId ? "Reply posted successfully" : "Comment posted successfully"
      );
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
        <span className="text-sm text-gray-500">
          {getTotalCommentCount(comments)} comments
        </span>
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
            <DialogContent className="max-w-lg w-full max-h-[80vh] md:h-[fit-content]">
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
                  isModal
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
              comment={comment}
              solutionId={solutionId}
              onDeleted={() => handleCommentDeleted(comment.id)}
              onReplySubmit={handleCommentSubmit}
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
