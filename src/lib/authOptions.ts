import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextAuthOptions, Session, User } from "next-auth";
//import { JWT } from "next-auth/jwt";
//import { encode as defaultEncode } from "next-auth/jwt";
//import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) {
          //console.log("User not found");
          return null;
        }
        if (user.status !== "ACTIVE") {
          //console.log("User not active");
          return null;
        }
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          //console.log("Invalid password");
          return null;
        }
        // Map role to 'admin' or 'user'
        const role = user.role?.toLowerCase() === "admin" ? "admin" : "user";
        // Return only the fields you want in the session/JWT!
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/register",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // On login, set role from user object
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      } else if (token.email) {
        // On subsequent requests, fetch user from DB to get latest role
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true }
        });
        if (dbUser) {
          token.role = dbUser.role?.toLowerCase() === 'admin' ? 'admin' : 'user';
        }
      }
      return token;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, username: true, role: true }
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.username = dbUser.username;
          // Normalize role to 'admin' or 'user'
          session.user.role = dbUser.role?.toLowerCase() === 'admin' ? 'admin' : 'user';
        } else {
          // Fallback: ensure role is at least 'user'
          session.user.role = session.user.role || 'user';
        }
      } else {
        // Fallback: ensure role is at least 'user'
        session.user.role = session.user.role || 'user';
      }
      console.log('session callback:', session);
      return session;
    }
  },
};