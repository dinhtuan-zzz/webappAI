import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { encode as defaultEncode } from "next-auth/jwt";
import { randomUUID } from "crypto";

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
          include: { roles: { include: { role: true } } },
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
        // Map roles to string array
        const roleNames = user.roles.map((ur) => ur.role.name);
        // Pick 'admin' if user has ADMIN role, otherwise 'user'
        const role = roleNames.includes("ADMIN") ? "admin" : "user";
        return {
          ...user,
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
      if (user) {
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, user, token }) {
      if (session.user) {
        if (user) {
          session.user.id = user.id;
          session.user.username = user.username;
          session.user.role = user.role;
        } else if (token) {
          session.user.role = token.role as string;
        }
      }
      return session;
    }
  },
};