import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean | Date | null;
    accessToken: string;
    role: "user" | "superAdmin";
    createdAt: Date;
  }

  interface Session {
    user: User;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    emailVerified: boolean | Date | null;
    userId: string;
    userEmail: string;
    userName: string;
    userRole: "user" | "superAdmin";
    createdAt: Date;
  }
}
