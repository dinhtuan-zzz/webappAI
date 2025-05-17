import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            username: true,
            profile: { select: { avatarUrl: true, displayName: true } },
          },
        },
        tags: { include: { tag: true } },
        _count: {
          select: { votes: true, comments: true },
        },
      },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
} 