"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentFormProps {
  solutionId: string;
  parentId?: string;
  onSubmit: (content: string, solutionId: string, parentId?: string) => void;
  onCancel?: () => void;
  userAvatar?: string;
  userName?: string;
  placeholder?: string;
  isReply?: boolean;
}

export default function CommentForm({
  solutionId,
  parentId,
  onSubmit,
  onCancel,
  userAvatar,
  userName = "Guest User",
  placeholder = "Add a comment...",
  isReply = false,
}: CommentFormProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment, solutionId, parentId);
      setComment("");
    }
  };

  // Get initials for avatar fallback
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-3 ${isReply ? "mt-2" : "mt-4"}`}
    >
      <Avatar className={`${isReply ? "h-6 w-6" : "h-8 w-8"} mt-1`}>
        <AvatarImage src={userAvatar} alt={userName} />
        <AvatarFallback className={isReply ? "text-xs" : ""}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder={placeholder}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={`resize-none ${isReply ? "min-h-16 text-sm" : "min-h-24 text-sm"}`}
          data-comment-input
        />
        <div className="flex justify-end gap-2">
          {isReply && onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!comment.trim()}
            size={isReply ? "sm" : "default"}
            className="bg-[#2F4858] hover:bg-[#1e2f38] text-white"
          >
            {isReply ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>
    </form>
  );
}
