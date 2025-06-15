/**
 * Utilities for managing user interactions in sessionStorage
 */

/**
 * Clear all user interaction data from sessionStorage
 * This should be called when a user logs out to prevent interaction data
 * from bleeding into other user sessions
 */
export function clearAllUserInteractions() {
  if (typeof window === "undefined") return;

  try {
    // Clear interaction data for all users
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith("user-interactions-")) {
        sessionStorage.removeItem(key);
      }
    });
    // Also clear the old generic key if it exists
    sessionStorage.removeItem("user-interactions");
  } catch (e) {
    console.warn("Failed to clear user interactions:", e);
  }
}

/**
 * Clear interaction data for a specific user
 * @param userId - The user ID to clear interactions for
 */
export function clearUserInteractions(userId: string) {
  if (typeof window === "undefined") return;

  try {
    const storageKey = `user-interactions-${userId}`;
    sessionStorage.removeItem(storageKey);
  } catch (e) {
    console.warn(`Failed to clear interactions for user ${userId}:`, e);
  }
}

/**
 * Get the storage key for a specific user
 * @param userId - The user ID (can be user ID or email)
 * @returns The storage key for the user's interactions
 */
export function getUserInteractionsKey(userId: string): string {
  return `user-interactions-${userId}`;
}

/**
 * Check if there are any stored interactions for any user
 * @returns True if there are stored interactions, false otherwise
 */
export function hasStoredInteractions(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const keys = Object.keys(sessionStorage);
    return keys.some((key) => key.startsWith("user-interactions-"));
  } catch (e) {
    console.warn("Failed to check for stored interactions:", e);
    return false;
  }
}
