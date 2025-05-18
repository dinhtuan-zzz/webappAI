import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user || user.id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const logs = await prisma.auditLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      action: true,
      target: true,
      ip: true,
      createdAt: true,
      meta: true,
    },
  });
  return NextResponse.json({ activity: logs });
} 