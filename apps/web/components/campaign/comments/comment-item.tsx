import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import AdminActions from "@/components/admin/admin-actions";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { Comment } from "@/lib/types/index";
import { useState } from "react";
import CommentForm from "./comment-form";
import { useAuthSession } from "@/hooks/use-auth-session";

interface CommentItemProps {
  comment: Comment;
  solutionId: string;
  onDeleted?: (commentId: string) => void;
  onReplySubmit?: (
    content: string,
    solutionId: string,
    parentId?: string
  ) => void;
  depth?: number;
}

export default function CommentItem({
  comment,
  solutionId,
  onDeleted,
  onReplySubmit,
  depth = 0,
}: CommentItemProps) {
  const { canDelete } = useAdminPermissions();
  const { session } = useAuthSession();
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Get initials for avatar fallback
  const initials = (comment.userName || "Anonymous")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleReplySubmit = (
    content: string,
    solutionId: string,
    parentId?: string
  ) => {
    if (onReplySubmit) {
      onReplySubmit(content, solutionId, parentId);
      setShowReplyForm(false);
    }
  };

  // Limit nesting depth to prevent infinite recursion
  const maxDepth = 3;
  const isNested = depth > 0;
  const canNest = depth < maxDepth;

  return (
    <div
      data-comment-id={comment.id}
      className={`comment-item ${isNested ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}
    >
      <div className="group flex gap-3 py-3 hover:bg-gray-50 rounded-lg px-2">
        <Avatar className={`${isNested ? "h-6 w-6" : "h-8 w-8"}`}>
          <AvatarImage
            src={comment.userAvatar || undefined}
            alt={comment.userName || "Anonymous"}
          />
          <AvatarFallback className={isNested ? "text-xs" : ""}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span
                className={`font-medium ${isNested ? "text-xs" : "text-sm"}`}
              >
                {comment.userName || "Anonymous"}
              </span>
              <span
                className={`text-gray-500 ${isNested ? "text-xs" : "text-xs"}`}
              >
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Botón de administración - Solo visible si el usuario tiene permisos */}
            {canDelete(comment.userId) && (
              <AdminActions
                type="comment"
                resourceId={comment.id}
                resourceOwnerId={comment.userId}
                onDeleted={() => onDeleted && onDeleted(comment.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </div>
          <p
            className={`mt-1 text-gray-700 ${isNested ? "text-xs" : "text-sm"}`}
          >
            {comment.content}
          </p>

          {/* Reply button */}
          {session && canNest && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-[#548281] hover:text-[#2F4858] p-0 h-auto"
              >
                Reply
              </Button>
            </div>
          )}

          {/* Reply form */}
          {showReplyForm && session && (
            <CommentForm
              solutionId={solutionId}
              parentId={comment.id}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyForm(false)}
              userAvatar={session.user?.image || undefined}
              userName={session.user?.name || "Anonymous"}
              placeholder="Write a reply..."
              isReply={true}
            />
          )}
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              solutionId={solutionId}
              onDeleted={(commentId) => onDeleted && onDeleted(commentId)} // Pass the deletion callback with correct ID
              onReplySubmit={onReplySubmit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
