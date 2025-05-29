"use client";

import React, { createContext, useContext, useState } from "react";

type InteractionType = "like" | "dislike" | "comment" | "share";

interface InteractionState {
  [key: string]: {
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
    userLiked: boolean;
    userDisliked: boolean;
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
  setUserInteraction: (
    type: InteractionType,
    solutionId: string,
    value: boolean
  ) => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(
  undefined
);

interface InteractionProviderProps {
  children: React.ReactNode;
  initialStats?: Record<
    string,
    {
      likes: number;
      dislikes: number;
      comments: number;
      shares: number;
      userLiked?: boolean;
      userDisliked?: boolean;
      userCommented?: boolean;
    }
  >;
}

export function InteractionProvider({
  children,
  initialStats = {},
}: InteractionProviderProps) {
  const [interactions, setInteractions] =
    useState<InteractionState>(initialStats);

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
          : type === "dislike"
            ? "dislikes"
            : type === "comment"
              ? "comments"
              : "shares"]: count,
      },
    }));
  };

  const setUserInteraction = (
    type: InteractionType,
    solutionId: string,
    value: boolean
  ) => {
    setInteractions((prev) => ({
      ...prev,
      [solutionId]: {
        ...prev[solutionId],
        [type === "like"
          ? "userLiked"
          : type === "dislike"
            ? "userDisliked"
            : type === "comment"
              ? "userCommented"
              : "userShared"]: value,
      },
    }));
  };

  const getInteractionCount = (type: InteractionType, solutionId: string) => {
    const solution = interactions[solutionId];
    if (!solution) return 0;
    return type === "like"
      ? solution.likes
      : type === "dislike"
        ? solution.dislikes
        : type === "comment"
          ? solution.comments
          : solution.shares;
  };

  const getUserInteraction = (type: InteractionType, solutionId: string) => {
    const solution = interactions[solutionId];
    if (!solution) return false;
    return type === "like"
      ? solution.userLiked
      : type === "dislike"
        ? solution.userDisliked
        : type === "comment"
          ? solution.userCommented
          : false;
  };

  return (
    <InteractionContext.Provider
      value={{
        handleInteraction,
        getInteractionCount,
        getUserInteraction,
        setUserInteraction,
      }}
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
