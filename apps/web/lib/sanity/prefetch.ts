// Prefetch utility for preloading data on user interactions
import { getCampaignBySlug } from "./queries";
import { logger } from "@/lib/utils/logger";

// Track which resources have been prefetched to avoid duplicate calls
const prefetchCache = new Set<string>();

/**
 * Safely prefetch campaign data when user hovers over campaign links
 * to improve perceived performance
 */
export function prefetchCampaign(slug: string): void {
  // Guard against empty or invalid slugs
  if (!slug || typeof slug !== "string") {
    logger.warn("[Prefetch] Invalid campaign slug provided");
    return;
  }

  const cacheKey = `campaign-${slug}`;

  // Only prefetch if not already in prefetch cache
  if (!prefetchCache.has(cacheKey)) {
    // Mark as prefetched before the async operation to prevent duplicate calls
    prefetchCache.add(cacheKey);
    logger.log(`[Prefetch] Starting preload for campaign: ${slug}`);

    // Use setTimeout to ensure this runs in the next event loop cycle
    // and doesn't block the UI thread during interaction
    setTimeout(() => {
      getCampaignBySlug(slug)
        .then((campaign) => {
          if (campaign) {
            logger.log(
              `[Prefetch] Successfully preloaded campaign: ${campaign.title}`
            );
          } else {
            logger.warn(`[Prefetch] No campaign data found for slug: ${slug}`);
            // Remove from prefetch cache so it can be tried again later
            prefetchCache.delete(cacheKey);
          }
        })
        .catch((error) => {
          logger.error(`[Prefetch] Error preloading campaign ${slug}:`, error);
          // Remove from prefetch cache on error so it can be tried again
          prefetchCache.delete(cacheKey);
        });
    }, 0);
  }
}

/**
 * Clear prefetch cache entries that are older than the specified age
 * Call this periodically to avoid memory leaks
 */
export function clearOldPrefetchEntries(): void {
  prefetchCache.clear();
  logger.log("[Prefetch] Cache cleared");
}
