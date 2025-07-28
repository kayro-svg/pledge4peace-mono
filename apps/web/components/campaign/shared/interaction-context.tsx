"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";

type InteractionType = "like" | "dislike" | "comment" | "share";

interface InteractionData {
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  userLiked: boolean;
  userDisliked: boolean;
  userCommented: boolean;
  userShared: boolean;
}

type InteractionState = Record<string, InteractionData>;

interface InteractionContextType {
  // Get current stats
  getInteractionCount: (type: InteractionType, solutionId: string) => number;
  getUserInteraction: (type: InteractionType, solutionId: string) => boolean;

  // Update from backend API responses
  updateFromBackend: (
    solutionId: string,
    stats: {
      likes: number;
      dislikes: number;
      shares: number;
    },
    userInteractions: {
      hasLiked: boolean;
      hasDisliked: boolean;
      hasShared: boolean;
    }
  ) => void;

  // Initialize solution with initial data
  initializeSolution: (
    solutionId: string,
    initialStats: {
      likes: number;
      dislikes: number;
      comments: number;
      shares: number;
    },
    userInteractions?: {
      hasLiked: boolean;
      hasDisliked: boolean;
      hasShared: boolean;
    }
  ) => void;

  // Force re-initialize solution (useful for refreshing state)
  forceInitializeSolution: (
    solutionId: string,
    initialStats: {
      likes: number;
      dislikes: number;
      comments: number;
      shares: number;
    },
    userInteractions?: {
      hasLiked: boolean;
      hasDisliked: boolean;
      hasShared: boolean;
    }
  ) => void;

  // Update comment count
  updateCommentCount: (solutionId: string, count: number) => void;
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
  const { session } = useAuthSession();

  // Get interaction count for a specific type
  const getInteractionCount = useCallback(
    (type: InteractionType, solutionId: string): number => {
      const solutionData = interactions[solutionId];
      if (!solutionData) return 0;

      switch (type) {
        case "like":
          return solutionData.likes;
        case "dislike":
          return solutionData.dislikes;
        case "comment":
          return solutionData.comments;
        case "share":
          return solutionData.shares;
        default:
          return 0;
      }
    },
    [interactions]
  );

  // Get user interaction status
  const getUserInteraction = useCallback(
    (type: InteractionType, solutionId: string): boolean => {
      if (!session) return false;

      const solutionData = interactions[solutionId];
      if (!solutionData) return false;

      switch (type) {
        case "like":
          return solutionData.userLiked;
        case "dislike":
          return solutionData.userDisliked;
        case "comment":
          return solutionData.userCommented;
        case "share":
          return solutionData.userShared;
        default:
          return false;
      }
    },
    [interactions, session]
  );

  // Update from backend API response
  const updateFromBackend = useCallback(
    (
      solutionId: string,
      stats: {
        likes: number;
        dislikes: number;
        shares: number;
      },
      userInteractions: {
        hasLiked: boolean;
        hasDisliked: boolean;
        hasShared: boolean;
      }
    ) => {
      setInteractions((prev) => ({
        ...prev,
        [solutionId]: {
          ...prev[solutionId],
          likes: stats.likes,
          dislikes: stats.dislikes,
          shares: stats.shares,
          userLiked: userInteractions.hasLiked,
          userDisliked: userInteractions.hasDisliked,
          userShared: userInteractions.hasShared,
          // Keep existing comment data
          comments: prev[solutionId]?.comments || 0,
          userCommented: prev[solutionId]?.userCommented || false,
        },
      }));
    },
    []
  );

  // Initialize solution with initial data
  const initializeSolution = useCallback(
    (
      solutionId: string,
      initialStats: {
        likes: number;
        dislikes: number;
        comments: number;
        shares: number;
      },
      userInteractions?: {
        hasLiked: boolean;
        hasDisliked: boolean;
        hasShared: boolean;
      }
    ) => {
      setInteractions((prev) => {
        // Only initialize if solution doesn't exist
        if (prev[solutionId]) {
          return prev;
        }

        return {
          ...prev,
          [solutionId]: {
            likes: initialStats.likes,
            dislikes: initialStats.dislikes,
            comments: initialStats.comments,
            shares: initialStats.shares,
            userLiked: userInteractions?.hasLiked || false,
            userDisliked: userInteractions?.hasDisliked || false,
            userCommented: false,
            userShared: userInteractions?.hasShared || false,
          },
        };
      });
    },
    []
  );

  // Force re-initialize solution (useful for refreshing state)
  const forceInitializeSolution = useCallback(
    (
      solutionId: string,
      initialStats: {
        likes: number;
        dislikes: number;
        comments: number;
        shares: number;
      },
      userInteractions?: {
        hasLiked: boolean;
        hasDisliked: boolean;
        hasShared: boolean;
      }
    ) => {
      setInteractions((prev) => {
        // Force re-initialize by setting all fields to their initial values
        return {
          ...prev,
          [solutionId]: {
            likes: initialStats.likes,
            dislikes: initialStats.dislikes,
            comments: initialStats.comments,
            shares: initialStats.shares,
            userLiked: userInteractions?.hasLiked || false,
            userDisliked: userInteractions?.hasDisliked || false,
            userCommented: false,
            userShared: userInteractions?.hasShared || false,
          },
        };
      });
    },
    []
  );

  // Update comment count
  const updateCommentCount = useCallback(
    (solutionId: string, count: number) => {
      setInteractions((prev) => ({
        ...prev,
        [solutionId]: {
          ...prev[solutionId],
          comments: count,
          // Initialize with defaults if solution doesn't exist
          likes: prev[solutionId]?.likes || 0,
          dislikes: prev[solutionId]?.dislikes || 0,
          shares: prev[solutionId]?.shares || 0,
          userLiked: prev[solutionId]?.userLiked || false,
          userDisliked: prev[solutionId]?.userDisliked || false,
          userCommented: prev[solutionId]?.userCommented || false,
          userShared: prev[solutionId]?.userShared || false,
        },
      }));
    },
    []
  );

  const value = {
    getInteractionCount,
    getUserInteraction,
    updateFromBackend,
    initializeSolution,
    forceInitializeSolution,
    updateCommentCount,
  };

  return (
    <InteractionContext.Provider value={value}>
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
