"use client";

import { useState, useEffect } from "react";
import CommentItem from "./comment-item";
import CommentForm from "./comment-form";
import { useInteractions } from "../shared/interaction-context";
import Image from "next/image";

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  solutionId: string;
}

interface CommentsSectionProps {
  solutionId?: string;
}

export default function CommentsSection({ solutionId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleInteraction, getInteractionCount } = useInteractions();

  // Mock user data - in a real app, this would come from authentication
  const currentUser = {
    id: "user-1",
    name: "John Doe",
    avatar: "/avatars/user-1.png",
  };

  useEffect(() => {
    // In a real app, this would be a fetch call to your API
    const fetchComments = async () => {
      setLoading(true);

      // Mock data for demo
      const mockComments: Comment[] = [
        // {
        //   id: "comment-1",
        //   author: {
        //     id: "user-2",
        //     name: "Jane Smith",
        //     avatar: "/avatars/user-2.png",
        //   },
        //   content:
        //     "This is a fantastic solution! I really appreciate the thoughtfulness behind it.",
        //   createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        //   solutionId: "solution-1",
        // },
        // {
        //   id: "comment-2",
        //   author: {
        //     id: "user-3",
        //     name: "Michael Johnson",
        //     avatar: "/avatars/user-3.png",
        //   },
        //   content:
        //     "I'm wondering how this would be implemented in practice? Has anyone tried something similar?",
        //   createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        //   solutionId: "solution-1",
        // },
      ];

      // Filter comments for the current solution if solutionId is provided
      const filteredComments = solutionId
        ? mockComments.filter((comment) => comment.solutionId === solutionId)
        : mockComments;

      setComments(filteredComments);
      setLoading(false);
    };

    fetchComments();
  }, [solutionId]);

  const handleCommentSubmit = async (content: string, solutionId: string) => {
    if (!solutionId) return;

    // Create new comment
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: currentUser,
      content,
      createdAt: new Date(),
      solutionId,
    };

    // Add comment to the local state
    setComments((prev) => [newComment, ...prev]);

    // Get the current comment count for this solution
    const currentCount = getInteractionCount("comment", solutionId);

    // Update the interaction count in the context
    await handleInteraction("comment", solutionId, currentCount + 1);

    // In a real app, you would also:
    // 1. Send the comment to a backend API
    // 2. The API would store the comment in a database
    // 3. The API would update the comment count in the database
    // 4. The API would return the new comment with its database ID
    // 5. You would update the UI with the returned comment
  };

  // Get the current comment count from the interaction context
  const commentCount = solutionId
    ? getInteractionCount("comment", solutionId)
    : 0;

  return (
    <div className="space-y-4">
      {solutionId && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Comments</h3>
            {/* TODO: Add comment count when we have the API */}
            {/* <span className="text-sm text-gray-500">
              {commentCount} comments
            </span> */}
            <span className="text-sm text-gray-500">
              {comments.length} comments
            </span>
          </div>

          <CommentForm
            solutionId={solutionId}
            onSubmit={handleCommentSubmit}
            userAvatar={currentUser.avatar}
            userName={currentUser.name}
          />
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
              createdAt={comment.createdAt}
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
