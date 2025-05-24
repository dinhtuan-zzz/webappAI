import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { cookies } from "next/headers";
import { z } from "zod";

/**
 * DELETE /api/users/[username]/sessions/[sessionId]
 *
 * Revokes a single session for the authenticated user.
 *
 * @returns {Response} JSON response with success boolean.
 */
export async function DELETE(req: Request, { params }: { params: { username: string, sessionId: string } }) {
  const { username, sessionId } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user || user.id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // Validate sessionId as a string (UUID)
  const sessionIdSchema = z.string().uuid();
  if (!sessionIdSchema.safeParse(sessionId).success) {
    return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 });
  }
  const targetSession = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!targetSession || targetSession.userId !== user.id) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  // Get current session token from cookies
  const currentToken =
    (await cookies()).get("next-auth.session-token")?.value ||
    (await cookies()).get("__Secure-next-auth.session-token")?.value;
  if (targetSession.sessionToken === currentToken) {
    return NextResponse.json({ error: "Cannot revoke current session" }, { status: 400 });
  }
  await prisma.session.delete({ where: { id: sessionId } });
  return NextResponse.json({ success: true });
} 