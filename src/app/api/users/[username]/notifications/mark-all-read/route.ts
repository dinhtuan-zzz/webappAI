import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * POST /api/users/[username]/notifications/mark-all-read
 * Marks all notifications as read for the user.
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
  console.log('Marking all as read for userId:', user.id);
  const result = await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  console.log('Update result:', result);

  // Fetch notifications after update for debugging
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  console.log('Notifications after update:', notifications);

  return NextResponse.json({ updated: result.count });
} 