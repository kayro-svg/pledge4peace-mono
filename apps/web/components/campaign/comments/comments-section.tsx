"use client";

import { useState, useEffect } from "react";
import CommentItem from "./comment-item";
import CommentForm from "./comment-form";
import { useInteractions } from "../shared/interaction-context";
import Image from "next/image";
import { getComments, createComment } from "@/lib/api/solutions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Comment } from "@/lib/types/index";

interface CommentsSectionProps {
  solutionId?: string;
}

export default function CommentsSection({ solutionId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleInteraction, getInteractionCount } = useInteractions();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchComments = async () => {
      if (!solutionId) return;

      setLoading(true);
      try {
        const fetchedComments = await getComments(solutionId);
        setComments(fetchedComments);
      } catch (error) {
        toast.error("Failed to load comments");
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [solutionId]);

  const handleCommentSubmit = async (content: string, solutionId: string) => {
    if (!solutionId || !session) {
      toast.error("You must be logged in to comment");
      return;
    }

    try {
      const newComment = await createComment({
        content,
        solutionId,
      });

      setComments((prev) => [newComment, ...prev]);

      const currentCount = getInteractionCount("comment", solutionId);
      await handleInteraction("comment", solutionId, currentCount + 1);

      toast.success("Comment posted successfully");
    } catch (error) {
      toast.error("Failed to post comment");
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="space-y-4">
      {solutionId && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Comments</h3>
            <span className="text-sm text-gray-500">
              {comments.length} comments
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
            <p className="text-sm text-gray-500 text-center py-2">
              Please sign in to comment
            </p>
          )}
        </>
      )}

      <div className="space-y-1 mt-4">
        {loading ? (
          <p className="text-center text-gray-500 py-4">Loading comments...</p>
        ) : comments.length > 0 && solutionId ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              id={comment.id}
              author={comment.author}
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
            {solutionId && (
              <p className="text-center text-gray-500 py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
