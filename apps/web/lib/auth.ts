import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import LinkedInProvider from "next-auth/providers/linkedin";
import { API_URL } from "@/lib/config";
import { logger } from "./utils/logger";

export const authOptions: NextAuthOptions = {
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid profile email",
        },
        url: "https://www.linkedin.com/oauth/v2/authorization",
      },
      token: {
        url: "https://www.linkedin.com/oauth/v2/accessToken",
      },
      userinfo: {
        url: "https://api.linkedin.com/v2/userinfo",
      },
      wellKnown:
        "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || "",
          email: profile.email || "",
          emailVerified:
            profile.email_verified === "true" ||
            profile.email_verified === true,
          image: profile.picture || "",
        } as any;
      },
    }),
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

          // Check if the response is JSON before parsing
          const contentType = res.headers.get("content-type");
          const isJson =
            contentType && contentType.includes("application/json");

          if (!isJson) {
            // If we get HTML or other content type, it's likely an error page
            const textResponse = await res.text();
            logger.error("Auth API returned non-JSON response:", {
              status: res.status,
              statusText: res.statusText,
              contentType,
              response: textResponse.substring(0, 200) + "...", // Log first 200 chars
            });
            throw new Error("Authentication service unavailable");
          }

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
        } catch (error) {
          logger.error("Authentication error:", error);

          // Provide more specific error messages
          if (error instanceof Error) {
            if (error.message.includes("fetch")) {
              throw new Error("Unable to connect to authentication service");
            }
            if (error.message.includes("Authentication service unavailable")) {
              throw new Error(
                "Authentication service is currently unavailable"
              );
            }
            throw new Error(error.message);
          }

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
    async jwt({ token, user, account, trigger, session }) {
      // Handle LinkedIn OIDC verification (independent of backend auth)
      if (account?.provider === "linkedin") {
        // Only store LinkedIn data temporarily for verification
        // We don't want to replace the user's existing session
        token.linkedinIdToken = account.id_token;
        token.linkedinAccessToken = account.access_token;
        token.linkedinSub = account.providerAccountId;
        token.linkedinEmail = user?.email || undefined;
        token.linkedinEmailVerified = user?.emailVerified || undefined;
        // Set a flag to indicate this is verification-only
        token.linkedinVerificationOnly = true;
        // Store raw token for verification - will be cleared from log
        logger.info("LinkedIn OIDC verification received", {
          sub: account.providerAccountId,
          hasEmail: !!user?.email,
        });
      }

      if (user) {
        // Guardar todos los datos relevantes del usuario en el token
        // LinkedIn login won't have accessToken from backend
        if (user.accessToken) {
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
                token.userRole = payload.role as
                  | "user"
                  | "moderator"
                  | "admin"
                  | "superAdmin";
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
          token.userRole = s.userRole as
            | "user"
            | "moderator"
            | "admin"
            | "superAdmin";
        }
        if (typeof s.user?.role === "string") {
          token.userRole = s.user.role as
            | "user"
            | "moderator"
            | "admin"
            | "superAdmin";
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
      // LinkedIn OIDC verification data - available even without backend token
      if (token.linkedinIdToken) {
        (session as any).linkedin = {
          idToken: token.linkedinIdToken as string,
          accessToken: token.linkedinAccessToken as string,
          sub: token.linkedinSub as string,
          email: token.linkedinEmail as string | undefined,
          emailVerified: token.linkedinEmailVerified as boolean | undefined,
        };
      }

      // If token is empty (expired) AND no LinkedIn session, return minimal valid session with no user
      if (!token.accessToken && !token.linkedinIdToken) {
        return {
          ...session,
          user: undefined,
          accessToken: "",
          backendTokenExpires: undefined,
        } as any;
      }

      if (session.user) {
        // If this is a LinkedIn verification-only session, don't replace the existing session
        const isVerificationOnly = token.linkedinVerificationOnly === true;

        if (isVerificationOnly && token.accessToken) {
          // Keep existing session, just add LinkedIn data for verification
          // Don't modify session.user
        } else if (
          token.linkedinIdToken &&
          !token.accessToken &&
          !isVerificationOnly
        ) {
          // If this is a LinkedIn-only session (not verification), populate minimal user data
          session.user.id = token.linkedinSub as string;
          session.user.email = token.linkedinEmail as string;
          session.user.name = "";
          session.user.emailVerified = token.linkedinEmailVerified as
            | boolean
            | null;
          session.user.role = "user";
          session.user.accessToken = "";
          session.user.createdAt = new Date();
        } else if (token.accessToken) {
          // Asegurar que todos los datos del usuario estén disponibles en la sesión
          session.user.id = token.userId as string;
          session.user.email =
            (token.userEmail as string) || session.user.email;
          session.user.name = (token.userName as string) || session.user.name;
          session.user.emailVerified = token.emailVerified as boolean | null;
          session.user.role =
            (token.userRole as "user" | "moderator" | "admin" | "superAdmin") ||
            "user";
          session.user.accessToken = token.accessToken as string;
          session.user.createdAt = token.createdAt as Date;
        }
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
          (session as unknown as Record<string, unknown>).postLoginRedirect =
            tokenAny.postLoginRedirect;
          delete tokenAny.postLoginRedirect;
        }
      }

      // También agregar el token a la raíz de la sesión para compatibilidad
      session.accessToken = (token.accessToken as string) || "";
      session.backendTokenExpires = token.backendTokenExpires as number;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
