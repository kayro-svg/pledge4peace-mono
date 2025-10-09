import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_URL } from "@/lib/config";
import { logger } from "./utils/logger";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Authentication failed");
          }

          // Return the user object and token
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            emailVerified: data.user.emailVerified,
            role: data.user.role,
            createdAt: data.user.createdAt,
            accessToken: data.token,
          };
        } catch {
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days to match backend token expiration
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Guardar todos los datos relevantes del usuario en el token
        token.accessToken = user.accessToken as string;
        token.emailVerified = user.emailVerified as boolean | null;
        token.userId = user.id as string;
        token.userEmail = user.email as string;
        token.userName = user.name as string;
        token.userRole =
          (user.role as "user" | "moderator" | "admin" | "superAdmin") ||
          "user";
        token.createdAt = user.createdAt as Date;

        // Extract expiration from backend JWT token
        try {
          const backendTokenParts = (user.accessToken as string).split(".");
          if (backendTokenParts.length === 3) {
            const payload = JSON.parse(atob(backendTokenParts[1]));
            token.backendTokenExpires = payload.exp;
          }
        } catch (error) {
          logger.error("Error parsing backend token:", error);
        }
      }

      // Allow client-side session.update() to update token fields
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as {
          accessToken?: string;
          user?: { name?: string; image?: string; role?: string };
          userRole?: string;
        };
        if (s.user?.name) {
          token.userName = s.user.name;
        }
        if (s.user?.image) {
          (token as unknown as Record<string, unknown>).userImage =
            s.user.image;
        }
        // Support refreshing access token and role via session.update()
        if (typeof s.accessToken === "string" && s.accessToken.length > 0) {
          token.accessToken = s.accessToken;
          try {
            const parts = s.accessToken.split(".");
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              token.backendTokenExpires = payload.exp;
              if (typeof payload.role === "string") {
                token.userRole = payload.role as "user" | "moderator" | "admin" | "superAdmin";
              }
              if (typeof payload.email === "string")
                token.userEmail = payload.email;
              if (typeof payload.sub === "string") token.userId = payload.sub;
              if (typeof payload.name === "string")
                token.userName = payload.name;
            }
          } catch {
            // Ignore token parsing errors
          }
        }
        if (typeof s.userRole === "string") {
          token.userRole = s.userRole as "user" | "moderator" | "admin" | "superAdmin";
        }
        if (typeof s.user?.role === "string") {
          token.userRole = s.user.role as "user" | "moderator" | "admin" | "superAdmin";
        }
      }

      // Check if backend token is expired
      if (
        token.backendTokenExpires &&
        typeof token.backendTokenExpires === "number"
      ) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (token.backendTokenExpires < currentTime) {
          // Backend token expired, mark as expired but keep structure
          token.accessToken = "";
          token.userId = "";
          token.userEmail = "";
          token.userName = "";
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If token is empty (expired), return null session
      if (!token.accessToken) {
        return null as unknown as typeof session;
      }

      if (session.user) {
        // Asegurar que todos los datos del usuario estén disponibles en la sesión
        session.user.id = token.userId as string;
        session.user.email = (token.userEmail as string) || session.user.email;
        session.user.name = (token.userName as string) || session.user.name;
        session.user.emailVerified = token.emailVerified as boolean | null;
        session.user.role =
          (token.userRole as "user" | "moderator" | "admin" | "superAdmin") ||
          "user";
        session.user.accessToken = token.accessToken as string;
        session.user.createdAt = token.createdAt as Date;
        // sync image when present in token
        const tokenRecord = token as unknown as Record<
          string,
          string | number | boolean | null | undefined
        >;
        if (typeof tokenRecord.userImage === "string") {
          session.user.image = tokenRecord.userImage;
        }
        // Post-login redirect passthrough (if backend login returned it, surface on session for the first client navigation)
        const tokenAny = token as Record<string, unknown>;
        if (typeof tokenAny.postLoginRedirect === "string") {
          (session as unknown as Record<string, unknown>).postLoginRedirect = tokenAny.postLoginRedirect;
          delete tokenAny.postLoginRedirect;
        }
      }

      // También agregar el token a la raíz de la sesión para compatibilidad
      session.accessToken = token.accessToken as string;
      session.backendTokenExpires = token.backendTokenExpires as number;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
