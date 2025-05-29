import { useState, useEffect, useCallback } from "react";
import { useInteractions } from "./interaction-context";

interface UseInteractionManagerProps {
  solutionId: string;
  initialCount: number;
}

export function useInteractionManager({
  solutionId,
  initialCount,
}: UseInteractionManagerProps) {
  const [count, setLocalCount] = useState(initialCount);
  const { handleInteraction, getInteractionCount } = useInteractions();
  const [lastUpdate, setLastUpdate] = useState(0);
  const RATE_LIMIT_MS = 1000; // 1 second rate limit

  // Sync with context count
  useEffect(() => {
    const contextCount = getInteractionCount("comment", solutionId);
    if (contextCount !== count) {
      setLocalCount(contextCount);
    }
  }, [solutionId, getInteractionCount, count]);

  const setCount = useCallback(
    async (newCount: number) => {
      const now = Date.now();
      if (now - lastUpdate < RATE_LIMIT_MS) {
        return;
      }

      setLocalCount(newCount);
      setLastUpdate(now);
      await handleInteraction("comment", solutionId, newCount);
    },
    [solutionId, handleInteraction, lastUpdate]
  );

  const incrementCount = useCallback(async () => {
    const now = Date.now();
    if (now - lastUpdate < RATE_LIMIT_MS) {
      return;
    }

    const newCount = count + 1;
    setLocalCount(newCount);
    setLastUpdate(now);
    await handleInteraction("comment", solutionId, newCount);
  }, [solutionId, handleInteraction, count, lastUpdate]);

  return {
    count,
    setCount,
    incrementCount,
  };
}
