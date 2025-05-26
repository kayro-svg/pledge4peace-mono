"use client";

import React, { createContext, useContext, useState } from "react";

type InteractionType = "like" | "comment" | "share";

interface InteractionState {
  [key: string]: {
    likes: number;
    comments: number;
    shares: number;
    userLiked: boolean;
    userCommented: boolean;
  };
}

interface InteractionContextType {
  handleInteraction: (
    type: InteractionType,
    solutionId: string,
    count: number
  ) => Promise<void>;
  getInteractionCount: (type: InteractionType, solutionId: string) => number;
  getUserInteraction: (type: InteractionType, solutionId: string) => boolean;
}

const InteractionContext = createContext<InteractionContextType | undefined>(
  undefined
);

export function InteractionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [interactions, setInteractions] = useState<InteractionState>({});

  const handleInteraction = async (
    type: InteractionType,
    solutionId: string,
    count: number
  ) => {
    setInteractions((prev) => ({
      ...prev,
      [solutionId]: {
        ...prev[solutionId],
        [type === "like"
          ? "likes"
          : type === "comment"
            ? "comments"
            : "shares"]: count,
        [type === "like"
          ? "userLiked"
          : type === "comment"
            ? "userCommented"
            : "userShared"]: count > 0,
      },
    }));
  };

  const getInteractionCount = (type: InteractionType, solutionId: string) => {
    const solution = interactions[solutionId];
    if (!solution) return 0;
    return type === "like"
      ? solution.likes
      : type === "comment"
        ? solution.comments
        : solution.shares;
  };

  const getUserInteraction = (type: InteractionType, solutionId: string) => {
    const solution = interactions[solutionId];
    if (!solution) return false;
    return type === "like"
      ? solution.userLiked
      : type === "comment"
        ? solution.userCommented
        : false;
  };

  return (
    <InteractionContext.Provider
      value={{ handleInteraction, getInteractionCount, getUserInteraction }}
    >
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteractions() {
  const context = useContext(InteractionContext);
  if (context === undefined) {
    throw new Error(
      "useInteractions must be used within an InteractionProvider"
    );
  }
  return context;
}
