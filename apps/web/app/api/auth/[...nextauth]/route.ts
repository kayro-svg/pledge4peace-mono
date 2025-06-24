import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_URL } from "@/lib/config";

const handler = NextAuth({
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
        } catch (error) {
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Guardar todos los datos relevantes del usuario en el token
        token.accessToken = user.accessToken as string;
        token.emailVerified = user.emailVerified as boolean | null;
        token.userId = user.id as string;
        token.userEmail = user.email as string;
        token.userName = user.name as string;
        token.userRole = (user.role as "user" | "superAdmin") || "user";
        token.createdAt = user.createdAt as Date;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Asegurar que todos los datos del usuario estén disponibles en la sesión
        session.user.id = token.userId as string;
        session.user.email = (token.userEmail as string) || session.user.email;
        session.user.name = (token.userName as string) || session.user.name;
        session.user.emailVerified = token.emailVerified as boolean | null;
        session.user.role = (token.userRole as "user" | "superAdmin") || "user";
        session.user.accessToken = token.accessToken as string;
        session.user.createdAt = token.createdAt as Date;
      }

      // También agregar el token a la raíz de la sesión para compatibilidad
      session.accessToken = token.accessToken as string;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
