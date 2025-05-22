import { useEffect, useState } from "react";

export function useAnimatedNumber(value: number, power?: number) {
  const [count, setCount] = useState(0);
  const targetValue = parseInt(value.toString().replace(/,/g, ""));

  useEffect(() => {
    let startTime: number;
    let lastUpdateTime: number = 0;
    let animationFrame: number;
    const duration = 3000; // 3 seconds (increased from 1.5 seconds)
    const updateInterval = 75; // Only update the count every 75ms

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Only update the count if enough time has passed since the last update
      if (currentTime - lastUpdateTime > updateInterval || progress >= 1) {
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, power || 10);
        const currentCount = Math.floor(easeOutQuart * targetValue);

        setCount(currentCount);
        lastUpdateTime = currentTime;
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, power]);

  return count;
}
