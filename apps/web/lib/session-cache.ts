import { Session } from "next-auth";

type CachedSession = {
  data: Session;
  timestamp: number;
};

class SessionCache {
  private static instance: SessionCache;
  private cache: Map<string, CachedSession>;
  private readonly TTL = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): SessionCache {
    if (!SessionCache.instance) {
      SessionCache.instance = new SessionCache();
    }
    return SessionCache.instance;
  }

  setSession(userId: string, session: Session) {
    this.cache.set(userId, {
      data: session,
      timestamp: Date.now(),
    });
  }

  getSession(userId: string): Session | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(userId);
      return null;
    }

    return cached.data;
  }

  clearSession(userId: string) {
    this.cache.delete(userId);
  }

  clearAll() {
    this.cache.clear();
  }
}

export const sessionCache = SessionCache.getInstance();
