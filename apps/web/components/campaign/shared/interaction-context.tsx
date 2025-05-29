"use client";

import React, { createContext, useContext, useState } from "react";

type InteractionType = "like" | "dislike" | "comment" | "share";

interface InteractionData {
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  userLiked: boolean;
  userDisliked: boolean;
  userCommented: boolean;
}

type InteractionState = Record<string, InteractionData>;

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
  initialStats?: InteractionState;
}

export function InteractionProvider({
  children,
  initialStats = {},
}: InteractionProviderProps) {
  const [interactions, setInteractions] = useState<InteractionState>(initialStats || {});

  const handleInteraction = async (
    type: InteractionType,
    solutionId: string,
    count: number
  ) => {
    setInteractions((prev) => {
      const current = prev[solutionId] || {
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
        userLiked: false,
        userDisliked: false,
        userCommented: false,
      };

      return {
        ...prev,
        [solutionId]: {
          ...current,
          [type === "like"
            ? "likes"
            : type === "dislike"
              ? "dislikes"
              : type === "comment"
                ? "comments"
                : "shares"]: count,
        },
      };
    });
  };

  const setUserInteraction = (
    type: InteractionType,
    solutionId: string,
    value: boolean
  ) => {
    setInteractions((prev) => {
      const current = prev[solutionId] || {
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
        userLiked: false,
        userDisliked: false,
        userCommented: false,
      };

      return {
        ...prev,
        [solutionId]: {
          ...current,
          [type === "like"
            ? "userLiked"
            : type === "dislike"
              ? "userDisliked"
              : "userCommented"]: value,
        },
      };
    });
  };

  const getInteractionCount = (type: InteractionType, solutionId: string): number => {
    const solution = interactions[solutionId];
    if (!solution) return 0;
    switch (type) {
      case 'like':
        return solution.likes;
      case 'dislike':
        return solution.dislikes;
      case 'comment':
        return solution.comments;
      case 'share':
        return solution.shares;
      default:
        return 0;
    }
  };

  const getUserInteraction = (type: InteractionType, solutionId: string): boolean => {
    const solution = interactions[solutionId];
    if (!solution) return false;
    switch (type) {
      case 'like':
        return !!solution.userLiked;
      case 'dislike':
        return !!solution.userDisliked;
      case 'comment':
        return !!solution.userCommented;
      default:
        return false;
    }
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
