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

  // Sync with context count when it changes
  useEffect(() => {
    const contextCount = getInteractionCount("comment", solutionId);
    if (contextCount !== count && contextCount > 0) {
      setLocalCount(contextCount);
    }
  }, [solutionId, getInteractionCount, count]);

  // Update initial count when it changes (new solution or fresh data)
  useEffect(() => {
    setLocalCount(initialCount);
  }, [initialCount, solutionId]);

  const setCount = useCallback(
    async (newCount: number) => {
      // Only update if the count actually changed
      if (newCount !== count) {
        setLocalCount(newCount);
        await handleInteraction("comment", solutionId, newCount);
      }
    },
    [solutionId, handleInteraction, count]
  );

  const incrementCount = useCallback(async () => {
    const newCount = count + 1;
    setLocalCount(newCount);
    await handleInteraction("comment", solutionId, newCount);
  }, [solutionId, handleInteraction, count]);

  return {
    count,
    setCount,
    incrementCount,
  };
}
