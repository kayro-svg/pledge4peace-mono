import { getSession, signOut } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async getValidToken(): Promise<string | null> {
    const session = await getSession();
    return session?.accessToken || session?.user?.accessToken || null;
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

      // Handle 401 errors
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));

        // Check if it's a token expiration issue
        if (
          errorData.message?.toLowerCase().includes("token") ||
          errorData.message?.toLowerCase().includes("expired") ||
          errorData.error?.toLowerCase().includes("token") ||
          errorData.message === "Token expired"
        ) {
          await this.handleAuthError();
          throw new Error("Session expired");
        }
      }

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(
      //     errorData.message || `HTTP error! status: ${response.status}`
      //   );
      // }

      // return await response.json();
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");

      // cuerpo parseado o texto plano según corresponda
      const body = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        // body puede ser objeto ({error, message}) o string
        const message =
          (typeof body === "string" ? body : body?.error || body?.message) ??
          `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      // para peticiones OK devolvemos el cuerpo ya parseado o en texto
      // (ajusta el tipo de retorno si sólo admites JSON en respuestas exitosas)
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

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
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
