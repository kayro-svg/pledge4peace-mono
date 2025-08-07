"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useRef, useEffect } from "react";
import { SanitySlug } from "@/lib/types";
import { useTranslations } from "next-intl";

interface FeaturedArticleProps {
  image: string;
  date: string;
  title: string;
  description: string;
  slug: string | SanitySlug;
}

export default function FeaturedArticle({
  image,
  date,
  title,
  description,
  slug,
}: FeaturedArticleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = useTranslations("Articles_Home");
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

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="relative h-[500px] md:h-[500px] lg:h-[500px] rounded-2xl overflow-hidden shadow-card group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={image}
        alt={title}
        fill
        className="w-full h-full object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-100 group-hover:from-black/60 group-hover:via-black/30 group-hover:to-transparent transition-all duration-300"></div>

      <div className="absolute inset-0 flex flex-col md:flex-row p-4 sm:p-6 md:p-8 text-white justify-end">
        {/* Left side - Title and CTA */}
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 w-full md:w-1/2 mb-4 md:mb-0 justify-end">
          <h4 className="text-xl sm:text-2xl md:text-3xl font-bold opacity-100 group-hover:opacity-0 transition-opacity duration-300">
            {title}
          </h4>
          <div className="hidden md:flex justify-start group">
            <Link
              href={slug as string}
              className="bg-[#548281]/30 text-white font-medium text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center hover:bg-white/50 transition-colors"
            >
              {t("featuredArticleReadMore")}
              <ArrowRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right side - Date and Description */}
        <div className="flex flex-col justify-end items-start md:items-end w-full md:w-1/2">
          <div className="flex items-center text-xs sm:text-sm text-gray-300 opacity-100 group-hover:opacity-0 transition-opacity duration-300 mb-2 sm:mb-3">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            {formattedDate}
          </div>
          <p className="text-sm sm:text-base text-gray-200 opacity-100 group-hover:opacity-0 transition-opacity duration-300 text-left md:text-right">
            {description.length > 120
              ? `${description.substring(0, 120)}...`
              : description}
          </p>
          <div className="md:hidden flex justify-end w-full group">
            <Link
              href={slug as string}
              className="bg-[#548281]/30 text-white font-medium text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center hover:bg-white/50 transition-colors"
            >
              {t("featuredArticleReadMore")}
              <ArrowRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
