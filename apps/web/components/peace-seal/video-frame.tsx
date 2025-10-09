"use client";

import { CirclePlay } from "lucide-react";

export default function VideoFrame({
  poster,
  videoId = "ScMzIvxBSi4",
}: {
  poster?: string;
  videoId?: string;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-md bg-black aspect-video">
      <iframe
        className="absolute inset-0 h-full w-full object-cover"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
        allowFullScreen
      />
      {/* optional: poster overlay */}
      {poster && (
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
        >
          <CirclePlay className="h-16 w-16 text-white/70 drop-shadow" />
        </div>
      )}
    </div>
  );
}
