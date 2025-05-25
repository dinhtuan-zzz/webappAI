// src/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username: string;
    role: string;
    roles?: string[]; // Add roles property for Prisma user object compatibility
  }
}