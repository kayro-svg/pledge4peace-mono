"use client";

import { MediaItem } from "@/lib/types";
import { useState } from "react";
import OptimizedImage from "@/components/ui/optimized-image";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";

export default function MediaGallery({
  media,
  overlayTitle,
  overlaySubtitle,
}: {
  media: Array<MediaItem>;
  overlayTitle: string;
  overlaySubtitle: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectMedia = (index: number) => {
    setCurrentIndex(index);
  };

  const currentMedia = media[currentIndex];

  return (
    <div className="w-full">
      {/* Main display */}
      <div className="relative rounded-xl overflow-hidden mb-4 aspect-[4/3] bg-gray-100">
        {/* Media display */}
        {currentMedia.type === "image" ? (
          <OptimizedImage
            src={currentMedia.image?.asset?.url as string}
            alt={currentMedia.alt as string || "Pledge4Peace campaign image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 60vw"
            sanityWidth={1200}
            sanityHeight={900}
            priority={currentIndex === 0} // Solo la primera imagen es priority
          />
        ) : (
          <video
            src={currentMedia.video?.asset?.url as string}
            className="w-full h-full object-cover"
            controls
            autoPlay
            muted={false}
            loop
          />
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-auto overflow-x-auto p-1 items-center justify-start gap-4">
        {media.map((item, index) => (
          <button
            key={index}
            onClick={() => selectMedia(index)}
            className={`relative flex-shrink-0 rounded-lg overflow-hidden w-28 h-20 md:w-48 md:h-32 transition-all ${
              index === currentIndex ? "ring-2 ring-[#548281]" : "opacity-80"
            }`}
          >
            {item.type === "image" ? (
              <OptimizedImage
                src={item.image?.asset?.url as string}
                alt={item.alt as string || "Pledge4Peace campaign image"}
                fill
                className="object-cover"
                sanityWidth={384}
                sanityHeight={256}
                sizes="(max-width: 768px) 40vw, 15vw"
              />
            ) : (
              <div className="relative w-full h-full bg-gray-200">
                <video
                  src={item.video?.asset?.url as string}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
