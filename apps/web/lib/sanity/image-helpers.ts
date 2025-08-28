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
  image?: string | SanityImage,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  const baseUrl =
    typeof image === "string"
      ? image
      : image?.asset?.url
        ? image.asset.url
        : "";

  if (!baseUrl) return "";

  // Preserve any pre-existing params while enforcing optimization params
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    // Fallback for malformed URLs
    return baseUrl;
  }

  if (width) url.searchParams.set("w", String(width));
  if (height) url.searchParams.set("h", String(height));
  if (quality !== 80) url.searchParams.set("q", String(quality));
  // Sensible defaults
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "crop");
  if (!url.searchParams.has("auto")) url.searchParams.set("auto", "format");

  return url.toString();
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
