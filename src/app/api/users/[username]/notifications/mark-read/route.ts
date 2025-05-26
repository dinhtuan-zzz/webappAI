import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { z } from "zod";

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

/**
 * POST /api/users/[username]/notifications/mark-read
 * Body: { ids: string[] }
 * Marks the specified notifications as read for the user.
 */
export async function POST(req: Request, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { username } = params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, role: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.id !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = await req.json();
  const parsed = markReadSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { ids } = parsed.data;
  const result = await prisma.notification.updateMany({
    where: { id: { in: ids }, userId: user.id },
    data: { isRead: true },
  });
  return NextResponse.json({ updated: result.count });
} 