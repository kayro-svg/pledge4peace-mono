"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  const { session, status, isAuthenticated } = useAuthSession();
  const [interactions, setInteractions] = useState<InteractionState>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Helper function to get the storage key for current user
  const getStorageKey = () => {
    const userId = session?.user?.id || session?.user?.email || "anonymous";
    return `user-interactions-${userId}`;
  };

  // Helper function to load interactions from sessionStorage
  const loadInteractionsFromStorage = () => {
    if (typeof window === "undefined") return {};

    try {
      const storageKey = getStorageKey();
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to restore interactions from sessionStorage:", e);
    }
    return {};
  };

  // Helper function to save interactions to sessionStorage
  const saveInteractionsToStorage = (newInteractions: InteractionState) => {
    if (typeof window === "undefined") return;

    try {
      const storageKey = getStorageKey();
      sessionStorage.setItem(storageKey, JSON.stringify(newInteractions));
    } catch (e) {
      console.warn("Failed to persist interactions to sessionStorage:", e);
    }
  };

  // Helper function to clear old user data when user changes
  const clearOldUserData = (oldUserId: string | null) => {
    if (typeof window === "undefined" || !oldUserId) return;

    try {
      const oldStorageKey = `user-interactions-${oldUserId}`;
      sessionStorage.removeItem(oldStorageKey);
      // Also remove the old generic key if it exists
      sessionStorage.removeItem("user-interactions");
    } catch (e) {
      console.warn("Failed to clear old user interactions:", e);
    }
  };

  // Effect to handle user session changes
  useEffect(() => {
    const newUserId = session?.user?.id || session?.user?.email || null;

    // If user changed, clear old data and load new data
    if (currentUserId !== newUserId) {
      // Clear old user data
      if (currentUserId) {
        clearOldUserData(currentUserId);
      }

      // Update current user ID
      setCurrentUserId(newUserId);

      // Load interactions for new user (or clear if no user)
      if (newUserId) {
        const userInteractions = loadInteractionsFromStorage();
        setInteractions({ ...initialStats, ...userInteractions });
      } else {
        // No user logged in, clear interactions
        setInteractions({});
      }
    }
  }, [
    session?.user?.id,
    session?.user?.email,
    status,
    currentUserId,
    initialStats,
  ]);

  // Helper function to get user interaction status
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
    // Only update if user is logged in
    if (!session?.user) return;

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
      saveInteractionsToStorage(newState);

      return newState;
    });
  };

  const handleInteraction = async (
    type: InteractionType,
    solutionId: string,
    count: number
  ) => {
    // Only update if user is logged in
    if (!session?.user) return;

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

      const newState = {
        ...prev,
        [solutionId]: {
          ...current,
          [countField]: count,
        },
      };

      // Persist to sessionStorage
      saveInteractionsToStorage(newState);

      return newState;
    });
  };

  const setUserInteraction = (
    type: InteractionType,
    solutionId: string,
    value: boolean
  ) => {
    // Only update if user is logged in
    if (!session?.user) return;

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
        saveInteractionsToStorage(newState);

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
        // Clear current user's interactions
        const storageKey = getStorageKey();
        sessionStorage.removeItem(storageKey);
        // Also remove the old generic key if it exists
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
    // Only update if user is logged in
    if (!session?.user) return;

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
        saveInteractionsToStorage(newState);

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
