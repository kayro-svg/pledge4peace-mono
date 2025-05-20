"use client";

import { Heart, ThumbsDown, Share2, MessageSquare } from "lucide-react";
import InteractionCounter from "../shared/interaction-counter";
import { useEffect } from "react";
import { useInteractions } from "../shared/interaction-context";

interface SolutionActionsBarProps {
  solutionId: string;
}

export default function SolutionActionsBar({
  solutionId,
}: SolutionActionsBarProps) {
  const { handleInteraction, getInteractionCount } = useInteractions();

  const handleCommentClick = () => {
    console.log("solutionID", solutionId);
    // Find the comments tab section
    const commentsSection = document.querySelector(
      '[data-tab-value="comments"]'
    );

    // Scroll to comments section smoothly
    if (commentsSection) {
      // window.scrollTo({
      //   top: commentsSection.getBoundingClientRect().top + window.scrollY - 100,
      //   behavior: "smooth",
      // });

      // Focus the comment textarea after scrolling
      setTimeout(() => {
        const commentTextarea = document.querySelector(
          "[data-comment-input]"
        ) as HTMLTextAreaElement;
        if (commentTextarea) {
          commentTextarea.focus();
        }
      }, 500); // Small delay to ensure scrolling completes
    }

    // No actualizamos el contador al hacer click en el botón de comentarios
    // porque esto solo debe ocurrir cuando realmente se envía un comentario
    // El contador se actualiza en el CommentsSection cuando se envía un comentario
  };

  return (
    <div className="border-t border-gray-200 grid grid-cols-4">
      <InteractionCounter icon={Heart} type="like" solutionId={solutionId} />

      <InteractionCounter
        icon={ThumbsDown}
        type="dislike"
        solutionId={solutionId}
      />

      <InteractionCounter
        icon={MessageSquare}
        type="comment"
        solutionId={solutionId}
        onClick={handleCommentClick}
      />

      <InteractionCounter icon={Share2} type="share" solutionId={solutionId} />
    </div>
  );
}
