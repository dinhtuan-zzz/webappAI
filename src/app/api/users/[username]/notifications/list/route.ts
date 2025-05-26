import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

function getTestSession(req: Request, username: string) {
  if (process.env.NODE_ENV === 'test') {
    const testUser = req.headers.get('x-test-user');
    if (testUser) {
      // Map username to userId and role for test users
      const userMap: Record<string, { id: string; role: string }> = {
        admin: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', role: 'admin' },
        alice: { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', role: 'user' },
        bob: { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', role: 'user' },
      };
      if (userMap[testUser]) {
        return { user: { id: userMap[testUser].id, username: testUser, role: userMap[testUser].role } };
      }
    }
  }
  return null;
}

/**
 * GET /api/users/[username]/notifications/list
 *
 * Query params:
 *   - page: number (default 1)
 *   - pageSize: number (default 20)
 *   - isRead: boolean (optional)
 *   - type: string (optional)
 *
 * Returns paginated notifications for the user.
 */
export async function GET(req: Request, { params }: { params: { username: string } }) {
  let session = getTestSession(req, params.username);
  if (!session) {
    session = await getServerSession(authOptions);
  }
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { username } = params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, role: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Only allow the user or an admin to access
  if (user.id !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const isRead = searchParams.get("isRead");
  const type = searchParams.get("type");
  const where: any = { userId: user.id };
  if (isRead === "true") where.isRead = true;
  if (isRead === "false") where.isRead = false;
  if (type) where.type = type;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);
  return NextResponse.json({ notifications, total, page, pageSize });
} 