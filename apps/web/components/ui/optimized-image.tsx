"use client";

import Image from "next/image";
import { useState } from "react";
import { getSanityImageUrl } from "@/lib/sanity/image-helpers";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  loading?: "lazy" | "eager";
  // Sanity specific props
  sanityWidth?: number;
  sanityHeight?: number;
  sanityQuality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  sizes,
  priority = false,
  quality = 80, // Balanced quality (Vercel default is 75-80)
  placeholder = "empty",
  blurDataURL,
  style,
  onClick,
  loading = "lazy", // Default to lazy loading
  sanityWidth,
  sanityHeight,
  sanityQuality,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Let Vercel handle optimization for most cases, only optimize Sanity if specific dimensions needed
  const optimizedSrc = (src.includes('cdn.sanity.io') && (sanityWidth || sanityHeight))
    ? getSanityImageUrl(src, sanityWidth || width || 800, sanityHeight || height || 600, sanityQuality || quality)
    : src;

  // Fallback image for errors
  const fallbackSrc = "/placeholder.svg";

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const imageProps = {
    src: imageError ? fallbackSrc : optimizedSrc,
    alt: alt || "Pledge4Peace image",
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: handleError,
    onLoad: handleLoad,
    onClick,
    style,
    quality,
    placeholder,
    blurDataURL,
    loading: priority ? "eager" : loading,
    ...(sizes && { sizes }),
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        priority={priority}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 800}
      height={height || 600}
      priority={priority}
    />
  );
}

// Hook for generating blur placeholders
export function useBlurDataURL(src: string): string {
  // Generate a simple blur placeholder
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle" dy=".3em">Loading...</text>
    </svg>`
  ).toString('base64')}`;
}
