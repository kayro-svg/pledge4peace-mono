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
  updateInteraction: (
    type: InteractionType,
    solutionId: string,
    count: number,
    userInteracted: boolean
  ) => void;
  syncUserInteraction: (
    type: InteractionType,
    solutionId: string,
    userInteracted: boolean
  ) => void;
  getInteractionCount: (type: InteractionType, solutionId: string) => number;
  getUserInteraction: (type: InteractionType, solutionId: string) => boolean;
  setUserInteraction: (
    type: InteractionType,
    solutionId: string,
    value: boolean
  ) => void;
  clearAllInteractions: () => void;
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
  const [interactions, setInteractions] = useState<InteractionState>(() => {
    // Try to restore from sessionStorage on initial load
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("user-interactions");
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...parsed, ...initialStats };
        }
      } catch (e) {
        console.warn("Failed to restore interactions from sessionStorage:", e);
      }
    }
    return initialStats || {};
  });

  // Helper function to get user interaction status - defined first so it can be used by setUserInteraction
  const getUserInteraction = (
    type: InteractionType,
    solutionId: string
  ): boolean => {
    const solution = interactions[solutionId];
    if (!solution) return false;
    switch (type) {
      case "like":
        return !!solution.userLiked;
      case "dislike":
        return !!solution.userDisliked;
      case "comment":
        return !!solution.userCommented;
      case "share":
        return false; // No userShared property in our model
      default:
        return false;
    }
  };

  const updateInteraction = (
    type: InteractionType,
    solutionId: string,
    count: number,
    userInteracted: boolean
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

      // Determine which fields to update based on the interaction type
      const countField =
        type === "like"
          ? "likes"
          : type === "dislike"
            ? "dislikes"
            : type === "comment"
              ? "comments"
              : "shares";

      const userPropKey =
        type === "like"
          ? "userLiked"
          : type === "dislike"
            ? "userDisliked"
            : "userCommented";

      const newState = {
        ...prev,
        [solutionId]: {
          ...current,
          [countField]: count,
          [userPropKey]: userInteracted,
        },
      };

      // Persist to sessionStorage
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("user-interactions", JSON.stringify(newState));
        } catch (e) {
          console.warn("Failed to persist interactions to sessionStorage:", e);
        }
      }

      return newState;
    });
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
        type === "like"
          ? "likes"
          : type === "dislike"
            ? "dislikes"
            : type === "comment"
              ? "comments"
              : "shares";

      // Always update the count (remove the early return)
      const newState = {
        ...prev,
        [solutionId]: {
          ...current,
          [countField]: count,
        },
      };

      // Persist to sessionStorage
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("user-interactions", JSON.stringify(newState));
        } catch (e) {
          console.warn("Failed to persist interactions to sessionStorage:", e);
        }
      }

      return newState;
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
          type === "like"
            ? "userLiked"
            : type === "dislike"
              ? "userDisliked"
              : "userCommented";

        const newState = {
          ...prev,
          [solutionId]: {
            ...current,
            [userPropKey]: value,
          },
        };

        // Persist to sessionStorage
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "user-interactions",
              JSON.stringify(newState)
            );
          } catch (e) {
            console.warn(
              "Failed to persist interactions to sessionStorage:",
              e
            );
          }
        }

        return newState;
      });
    }
  };

  const getInteractionCount = (
    type: InteractionType,
    solutionId: string
  ): number => {
    const solution = interactions[solutionId];
    if (!solution) return 0;
    switch (type) {
      case "like":
        return solution.likes;
      case "dislike":
        return solution.dislikes;
      case "comment":
        return solution.comments;
      case "share":
        return solution.shares;
      default:
        return 0;
    }
  };

  const clearAllInteractions = () => {
    setInteractions({});
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("user-interactions");
      } catch (e) {
        console.warn("Failed to clear interactions from sessionStorage:", e);
      }
    }
  };

  const syncUserInteraction = (
    type: InteractionType,
    solutionId: string,
    userInteracted: boolean
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

      const userPropKey =
        type === "like"
          ? "userLiked"
          : type === "dislike"
            ? "userDisliked"
            : "userCommented";

      // Only update if the value is different
      if (current[userPropKey] !== userInteracted) {
        const newState = {
          ...prev,
          [solutionId]: {
            ...current,
            [userPropKey]: userInteracted,
          },
        };

        // Persist to sessionStorage
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "user-interactions",
              JSON.stringify(newState)
            );
          } catch (e) {
            console.warn(
              "Failed to persist interactions to sessionStorage:",
              e
            );
          }
        }

        return newState;
      }

      return prev;
    });
  };

  return (
    <InteractionContext.Provider
      value={{
        handleInteraction,
        updateInteraction,
        syncUserInteraction,
        getInteractionCount,
        getUserInteraction,
        setUserInteraction,
        clearAllInteractions,
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
