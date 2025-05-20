"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useRef, useEffect } from "react";

interface FeaturedArticleProps {
  image: string;
  date: string;
  title: string;
  description: string;
}

export default function FeaturedArticle({
  image,
  date,
  title,
  description,
}: FeaturedArticleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video is paused on component mount
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="relative h-[450px] rounded-2xl overflow-hidden shadow-card group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/pledge4peace_hero_video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
      <div className="absolute inset-0 flex p-8 text-white justify-end items-end">
        <div className="flex flex-col gap-4 w-full max-w-[50%]">
          <h4 className="text-2xl md:text-3xl font-bold mb-3 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
            {title}
          </h4>
          <div className="flex justify-start mt-2 group">
            <Link
              href="#"
              className="bg-[#548281]/30 text-white font-normal text-md px-3 py-1 rounded-full flex items-center hover:bg-white/50 transition-colors"
            >
              See more{" "}
              <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-4 items-end w-full max-w-[50%] align-bottom">
          <div className="flex items-center text-sm mb-3 text-gray-300 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
            <Calendar className="w-4 h-4 mr-2" />
            {date}
          </div>
          <p className="text-gray-200 opacity-100 group-hover:opacity-0 transition-opacity duration-300 text-right">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
