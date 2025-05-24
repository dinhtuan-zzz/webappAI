import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { cookies } from "next/headers";
import { z } from "zod";

export interface UserSession {
  id: string;
  sessionToken: string;
  device: string;
  ip: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
}

/**
 * GET /api/users/[username]/sessions
 *
 * Returns a list of sessions for a user.
 *
 * @returns {Response} JSON response with an array of sessions.
 */
export async function GET(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user || user.id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const currentToken =
    (await cookies()).get("next-auth.session-token")?.value ||
    (await cookies()).get("__Secure-next-auth.session-token")?.value;
  const sessions = await prisma.session.findMany({ where: { userId: user.id } });
  const result: UserSession[] = sessions.map(s => ({
    id: s.id,
    sessionToken: s.sessionToken,
    device: s.device || "Unknown",
    ip: s.ip || "Unknown",
    location: s.location || "Unknown",
    lastActive: s.expires,
    isCurrent: s.sessionToken === currentToken,
  }));
  return NextResponse.json({ sessions: result });
}

/**
 * DELETE /api/users/[username]/sessions
 *
 * Revokes all sessions except the current one for the authenticated user.
 *
 * @returns {Response} JSON response with success boolean.
 */
export async function DELETE(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user || user.id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const allOthers = searchParams.get("allOthers");
  const allOthersSchema = z.literal("true");
  if (allOthersSchema.safeParse(allOthers).success) {
    const currentToken =
      (await cookies()).get("next-auth.session-token")?.value ||
      (await cookies()).get("__Secure-next-auth.session-token")?.value;
    // Delete all sessions except current
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        sessionToken: { not: currentToken },
      },
    });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Specify allOthers=true to revoke all other sessions." }, { status: 400 });
} 


