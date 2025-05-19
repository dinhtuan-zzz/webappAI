import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  
  const { username } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [total, comments] = await Promise.all([
    prisma.comment.count({ where: { authorId: user.id } }),
    prisma.comment.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  });
} 