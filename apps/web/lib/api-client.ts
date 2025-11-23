import { signOut } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
  }> = [];
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async processQueue(error: unknown, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  // Set token from session context (called by components with session)
  setToken(token: string | null) {
    this.cachedToken = token;
    if (token) {
      // Set expiry time for cache invalidation (30 minutes for valid tokens)
      this.tokenExpiry = Date.now() + 30 * 60 * 1000;
    } else {
      // Clear expiry when token is null
      this.tokenExpiry = 0;
    }
  }

  private async getValidToken(): Promise<string | null> {
    // Use cached token if available and not expired
    if (this.cachedToken && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    // Try to get token from NextAuth session
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();

      if (session?.accessToken) {
        // Cache the token for 5 minutes to avoid repeated session calls
        this.cachedToken = session.accessToken as string;
        this.tokenExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        return this.cachedToken;
      }
    } catch (error) {
      console.warn("Failed to get session token:", error);
    }

    // Clear expired token
    this.cachedToken = null;
    this.tokenExpiry = 0;
    return null;
  }

  private async handleAuthError() {
    // Show user-friendly message
    toast({
      title: "Sesión Expirada",
      description:
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      variant: "destructive",
    });

    // Clear session and redirect to login
    await signOut({ redirect: false });
    window.location.href = "/login";
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getValidToken();

    // Debug logging for token issues
    // if (process.env.NODE_ENV === "development") {
    //   console.log(`[ApiClient] Request to ${endpoint}:`, {
    //     hasToken: !!token,
    //     tokenLength: token?.length || 0,
    //     tokenExpiry: this.tokenExpiry,
    //     currentTime: Date.now(),
    //     isExpired: this.tokenExpiry > 0 && Date.now() >= this.tokenExpiry,
    //   });
    // }

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      // Determine content type first
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");

      // Read the body only once
      const body = isJson ? await response.json() : await response.text();

      // Handle 401 errors after reading the body
      if (response.status === 401) {
        // Check if it's a token expiration issue
        const errorMessage =
          typeof body === "string" ? body : body?.error || body?.message || "";

        if (
          errorMessage.toLowerCase().includes("token") ||
          errorMessage.toLowerCase().includes("expired") ||
          errorMessage === "Token expired"
        ) {
          await this.handleAuthError();
          throw new Error("Session expired");
        }
      }

      if (!response.ok) {
        // body puede ser objeto ({error, message}) o string
        const message =
          (typeof body === "string" ? body : body?.error || body?.message) ??
          `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      // para peticiones OK devolvemos el cuerpo ya parseado o en texto
      return body as unknown as T;
    } catch (error) {
      if (error instanceof Error && error.message === "Session expired") {
        throw error;
      }
      throw error;
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
import { API_URL } from "./config";
export const apiClient = new ApiClient(API_URL);
