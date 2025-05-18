import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { authOptions } from "@/lib/authOptions";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

function fromDate(time: number, date = Date.now()) {
  return new Date(date + time * 1000);
}

function generateSessionToken() {
  return randomUUID();
}

const handler = async (req: any, res: any) => {
  // Clone the authOptions to avoid mutation
  const options = { ...authOptions };

  // Patch callbacks to handle credentials login
  options.callbacks = {
    ...authOptions.callbacks,
    async signIn({ user, account, profile, email, credentials }) {
      // For credentials login, manually create a session and set cookie
      if (account?.provider === "credentials" && req.method === "POST" && req.url?.includes("callback")) {
        // --- Device Info ---
        let device = null;
        let ip = null;
        let location = null;
        // Parse device from user-agent
        if (req.headers && req.headers.get) {
          const ua = req.headers.get("user-agent") || "";
          device = ua;
        }
        // Get IP address (works for edge/serverless, may need adjustment for proxies)
        if (req.headers && req.headers.get) {
          ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
        }
        // Optionally, use an external API to get location from IP (not implemented here)
        // location = await getLocationFromIP(ip);
        // For now, set location to null or a placeholder
        location = null;
        if (ip) {
          try {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
            if (geoRes.ok) {
              const geo = await geoRes.json();
              if (geo.status === "success") {
                location = `${geo.city}, ${geo.country}`;
              }
            }
          } catch (e) {
            // Ignore geolocation errors, keep location as null
          }
        }
        // --- End Device Info ---
        const sessionToken = generateSessionToken();
        const sessionExpiry = fromDate(options.session?.maxAge ?? 7 * 24 * 60 * 60);
        await prisma.session.create({
          data: {
            sessionToken,
            userId: user.id,
            expires: sessionExpiry,
            device,
            ip,
            location,
          },
        });
        // Set cookie
        (await cookies()).set({
          name: "next-auth.session-token",
          value: sessionToken,
          expires: sessionExpiry,
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      }
      if (authOptions.callbacks?.signIn) {
        return authOptions.callbacks.signIn({ user, account, profile, email, credentials });
      }
      return true;
    },
  };

  // Patch jwt encode/decode to use session token for credentials
  options.jwt = {
    ...authOptions.jwt,
    encode: async ({ token, secret, maxAge }) => {
      if (req.url?.includes("callback") && req.url.includes("credentials") && req.method === "POST") {
        const cks = await cookies();
        const cookie = cks.get("next-auth.session-token");
        if (cookie) return cookie.value;
        return "";
      }
      // fallback to default
      if (authOptions.jwt?.encode) {
        return authOptions.jwt.encode({ token, secret, maxAge });
      }
      return "";
    },
    decode: async ({ token, secret }) => {
      if (req.url?.includes("callback") && req.url.includes("credentials") && req.method === "POST") {
        return null;
      }
      if (authOptions.jwt?.decode) {
        return authOptions.jwt.decode({ token, secret });
      }
      return null;
    },
  };

  // Pass to NextAuth
  // @ts-ignore
  return NextAuth(req, res, options);
};

export { handler as GET, handler as POST }; 