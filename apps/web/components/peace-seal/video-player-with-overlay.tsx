"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerWithOverlayProps {
  videoId: string;
  title?: string;
  subtitle?: string;
  thumbnailUrl?: string;
  labelsPosition?: "top" | "bottom";
}

export function VideoPlayerWithOverlay({
  videoId,
  title = "Understanding the Peace Seal",
  subtitle = "Watch the full story",
  thumbnailUrl,
  labelsPosition = "top",
}: VideoPlayerWithOverlayProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Use YouTube thumbnail if no custom thumbnail is provided
  const backgroundImage =
    thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-earth-dark group cursor-pointer">
      {!isPlaying ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${backgroundImage}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-earth-dark/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(true)}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform"
              aria-label="Play video"
            >
              <Play className="h-8 w-8 ml-1" />
            </button>
          </div>
          <div
            className={`absolute ${labelsPosition === "top" ? "top-6" : "bottom-6"} ${labelsPosition === "top" ? "left-6" : "right-6"} text-white`}
          >
            <p
              className={`text-sm font-medium opacity-80 ${labelsPosition === "top" ? "text-left" : "text-right"}`}
            >
              {subtitle}
            </p>
            <p
              className={`text-xl font-semibold ${labelsPosition === "top" ? "text-left" : "text-right"}`}
            >
              {title}
            </p>
          </div>
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
}
