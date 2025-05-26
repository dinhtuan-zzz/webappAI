import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * DELETE /api/users/[username]/notifications/[notificationId]
 * Deletes a notification for the user.
 */
export async function DELETE(req: Request, { params }: { params: { username: string; notificationId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { username, notificationId } = params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, role: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.id !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== user.id) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }
  await prisma.notification.delete({ where: { id: notificationId } });
  return NextResponse.json({ deleted: true });
} 