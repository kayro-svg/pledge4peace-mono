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

  // Helper function to get user interaction status - defined first so it can be used by setUserInteraction
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
      case 'share':
        return false; // No userShared property in our model
      default:
        return false;
    }
  };

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

      // Determine which field to update based on the interaction type
      const countField = 
        type === "like" ? "likes" :
        type === "dislike" ? "dislikes" :
        type === "comment" ? "comments" :
        "shares";
      
      // Only update if the count is different
      if (current[countField] === count) {
        return prev; // No change needed
      }

      return {
        ...prev,
        [solutionId]: {
          ...current,
          [countField]: count,
        },
      };
    });
  };

  const setUserInteraction = (
    type: InteractionType,
    solutionId: string,
    value: boolean
  ) => {
    // First check if this is actually a change to avoid unnecessary rerenders
    const currentValue = getUserInteraction(type, solutionId);
    
    // Only update if the value is actually different
    if (currentValue !== value) {
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

        // Return a new object only if there's an actual change
        const userPropKey = 
          type === "like" ? "userLiked" :
          type === "dislike" ? "userDisliked" :
          "userCommented";
        
        return {
          ...prev,
          [solutionId]: {
            ...current,
            [userPropKey]: value,
          },
        };
      });
    }
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
