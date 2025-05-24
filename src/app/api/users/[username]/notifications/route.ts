import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { z } from "zod";
import type { UserNotificationPreference } from "@/types/User";

const notificationPrefSchema = z.object({
  emailComment: z.boolean(),
  emailReply: z.boolean(),
  emailFollower: z.boolean(),
  emailMention: z.boolean(),
  emailNewsletter: z.boolean(),
});

/**
 * GET /api/users/[username]/notifications
 *
 * Returns the notification preferences for a user.
 *
 * @returns {Response} JSON response with the user's notification preferences.
 */
export async function GET(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  let prefs = await prisma.userNotificationPreference.findUnique({ where: { userId: user.id } });
  if (!prefs) {
    // Return defaults if not set
    prefs = {
      emailComment: true,
      emailReply: true,
      emailFollower: false,
      emailMention: false,
      emailNewsletter: false,
      userId: user.id,
      id: "",
    };
  }
  const result: UserNotificationPreference = {
    emailComment: prefs.emailComment,
    emailReply: prefs.emailReply,
    emailFollower: prefs.emailFollower,
    emailMention: prefs.emailMention,
    emailNewsletter: prefs.emailNewsletter,
  };
  return NextResponse.json({ preferences: result });
}

/**
 * PATCH /api/users/[username]/notifications
 *
 * Updates the notification preferences for the authenticated user.
 *
 * @returns {Response} JSON response with the updated preferences.
 */
export async function PATCH(req: Request, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { username } = params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = await req.json();
  const parsed = notificationPrefSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const updated = await prisma.userNotificationPreference.upsert({
      where: { userId: user.id },
      update: parsed.data,
      create: { userId: user.id, ...parsed.data },
    });
    const result: UserNotificationPreference = {
      emailComment: updated.emailComment,
      emailReply: updated.emailReply,
      emailFollower: updated.emailFollower,
      emailMention: updated.emailMention,
      emailNewsletter: updated.emailNewsletter,
    };
    return NextResponse.json({ preferences: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
} 