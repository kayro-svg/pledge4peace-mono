"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentFormProps {
  solutionId: string;
  onSubmit: (content: string, solutionId: string) => void;
  userAvatar?: string;
  userName?: string;
}

export default function CommentForm({
  solutionId,
  onSubmit,
  userAvatar,
  userName = "Guest User",
}: CommentFormProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment, solutionId);
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
    <form onSubmit={handleSubmit} className="flex gap-3 mt-4">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={userAvatar} alt={userName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none min-h-24 text-sm"
          data-comment-input
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!comment.trim()}
            className="bg-[#2F4858] hover:bg-[#1e2f38] text-white"
          >
            Comment
          </Button>
        </div>
      </div>
    </form>
  );
}
