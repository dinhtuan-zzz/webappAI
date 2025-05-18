import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const categories = searchParams.getAll("categories");
  const date = searchParams.get("date") || "all";

  // Build where clause
  const where: any = {};

  // Query filter (title or content)
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  // Categories filter
  if (categories.length > 0) {
    where.categories = {
      some: {
        categoryId: { in: categories },
      },
    };
  }

  // Date filter
  if (date !== "all") {
    const now = new Date();
    let from: Date | undefined;
    if (date === "today") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (date === "week") {
      from = new Date(now.getTime() - 7 * 86400000);
    } else if (date === "month") {
      from = new Date(now.getTime() - 30 * 86400000);
    } else if (date === "year") {
      from = new Date(now.getFullYear(), 0, 1);
    }
    if (from) {
      where.createdAt = { gte: from };
    }
  }

  // Query posts
  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          username: true,
          email: true,
          profile: { select: { avatarUrl: true, displayName: true } },
        },
      },
      categories: { select: { category: { select: { id: true } } } },
      _count: { select: { votes: true, comments: true } },
    },
    take: 30,
  });

  // Map to API shape
  const result = posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.content?.slice(0, 120) + (post.content?.length > 120 ? "..." : ""),
    author: post.author
      ? {
          username: post.author.username,
          email: post.author.email,
          profile: post.author.profile || null,
        }
      : null,
    createdAt: post.createdAt,
    categories: post.categories.map((pc: any) => pc.category.id),
    votes: post._count?.votes || 0,
    comments: post._count?.comments || 0,
    viewCount: post.viewCount || 0,
  }));

  return NextResponse.json(result);
} 