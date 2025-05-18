import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { cookies } from "next/headers";

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
  const result = sessions.map(s => ({
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

export async function DELETE(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user || user.id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const allOthers = searchParams.get("allOthers") === "true";
  if (allOthers) {
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


