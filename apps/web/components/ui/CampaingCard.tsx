"use client";

import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumbers";
import { useState, useEffect } from "react";
import PledgesProgressBar from "@/components/ui/pledges-progress-bar";

interface CampaignCardProps {
  image: string;
  title: string;
  description: string;
  link: string;
  imageWidth?: number;
  imageHeight?: number;
  campaignType?: "recent" | "your-activity" | "all-campaigns";
  goalValue?: number;
  currentValue?: number;
  variant?: "default" | "small" | "medium";
}

export default function CampaignCard({
  image,
  title,
  description,
  link,
  imageWidth = 16,
  imageHeight = 9,
  campaignType = "all-campaigns",
  goalValue = 10000,
  currentValue = 8000,
  variant = "default",
}: CampaignCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Start with current value displayed
  const startValue = currentValue * 0.5; // 50% of current value

  // Use the hook to animate between values
  const count = useAnimatedNumber(
    shouldAnimate ? startValue : currentValue, // Start from 50% when animation begins
    10
  );

  // When hover state changes, control animation
  useEffect(() => {
    if (isHovered) {
      // First set the count to the reduced value immediately
      setShouldAnimate(true);

      // Then after a tiny delay (for state to update), animate back up
      const timeout = setTimeout(() => {
        setShouldAnimate(false);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [isHovered]);

  // Calculate progress percentage (0-100)
  const progressPercentage = Math.min(
    100,
    Math.round((count / goalValue) * 100)
  );

  // Calculate aspect ratio for image container
  const aspectRatio = `${imageWidth} / ${imageHeight}`;

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full" style={{ aspectRatio }}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex-grow">
          <h3
            className={`text-[#252a34] text-2xl font-semibold mb-2 ${
              variant === "medium" ? "text-xl" : "text-2xl"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-[#555555] text-base line-clamp-3 ${
              variant === "medium" ? "text-sm" : "text-base"
            }`}
          >
            {description}
          </p>
        </div>
        <PledgesProgressBar
          currentValue={currentValue}
          goalValue={goalValue}
          variant={variant}
        />
        <button
          className={`bg-[#2f4858] text-white py-2 px-6 mt-4 rounded-full font-medium hover:bg-opacity-90 transition-colors w-fit ${
            variant === "medium" ? "text-xs" : "text-sm"
          }`}
          onClick={() => router.push(link)}
        >
          {campaignType === "your-activity" ? "View Campaign" : "Pledge Now"}
        </button>
      </div>
    </div>
  );
}
