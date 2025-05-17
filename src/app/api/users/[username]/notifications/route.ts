import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET: fetch notification preferences
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
      id: 0,
    };
  }
  return NextResponse.json({ preferences: prefs });
}

// PATCH: update notification preferences
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
  try {
    const updated = await prisma.userNotificationPreference.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });
    return NextResponse.json({ preferences: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
} 