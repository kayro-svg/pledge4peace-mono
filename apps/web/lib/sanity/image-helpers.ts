import { SanityImage } from "../types";

/**
 * Helper function to get optimized image URL from Sanity image object
 * @param image - Sanity image object
 * @param width - Optional width for image optimization
 * @param height - Optional height for image optimization
 * @param quality - Optional quality setting (1-100)
 * @returns Optimized image URL or empty string if no image
 */
export function getSanityImageUrl(
  image?: SanityImage,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!image?.asset?.url) {
    return "";
  }

  let url = image.asset.url;

  // Add optimization parameters if provided
  const params: string[] = [];

  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);
  if (quality !== 80) params.push(`q=${quality}`);

  // Add default optimization for better performance
  params.push("fit=crop");
  params.push("auto=format");

  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  return url;
}

/**
 * Helper function to check if Sanity image exists and has valid URL
 * @param image - Sanity image object
 * @returns Boolean indicating if image is valid
 */
export function hasSanityImage(image?: string | SanityImage): boolean {
  return Boolean(image);
}

/**
 * Get different sizes of the same image for responsive design
 * @param image - Sanity image object
 * @param quality - Optional quality setting
 * @returns Object with different image sizes
 */
export function getSanityImageSizes(image?: SanityImage, quality: number = 80) {
  if (!image?.asset?.url) {
    return {
      small: "",
      medium: "",
      large: "",
      xlarge: "",
      original: "",
    };
  }

  return {
    small: getSanityImageUrl(image, 400, undefined, quality),
    medium: getSanityImageUrl(image, 800, undefined, quality),
    large: getSanityImageUrl(image, 1200, undefined, quality),
    xlarge: getSanityImageUrl(image, 1920, undefined, quality),
    original: image.asset.url,
  };
}
