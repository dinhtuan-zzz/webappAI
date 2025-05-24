import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Post } from "@/types/Post";
import type { Category } from "@/types/Category";
import type { PostFilter } from "@/types/PostFilter";

/**
 * GET /api/search
 *
 * Searches posts by query, categories, and date filter.
 *
 * Query parameters:
 * - q: string (search query)
 * - categories: string[] (category IDs)
 * - date: string (date filter: today, week, month, year, all)
 *
 * @returns {Response} JSON response with an array of matching posts.
 *
 * Each post includes:
 * - id, slug, title, summary, content, createdAt, author, categories, _count, viewCount
 */
export async function GET(req: NextRequest) {
  const searchSchema = z.object({
    q: z.string().optional(),
    categories: z.union([z.string(), z.array(z.string())]).optional(),
    date: z.string().optional(),
  });
  const { searchParams } = new URL(req.url);
  const parsed = searchSchema.parse(Object.fromEntries(searchParams.entries()));
  const q = parsed.q || "";
  const categories = parsed.categories
    ? Array.isArray(parsed.categories)
      ? parsed.categories
      : [parsed.categories]
    : [];
  const date = parsed.date || "all";

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
      categories: { select: { category: { select: { id: true, name: true } } } },
      _count: { select: { votes: true, comments: true } },
    },
    take: 30,
  });

  // Map to API shape using strict types
  const result: Post[] = posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary ?? undefined,
    content: post.content,
    createdAt: post.createdAt,
    author: post.author ? {
      ...post.author,
      profile: post.author.profile ? {
        avatarUrl: post.author.profile.avatarUrl ?? undefined,
        displayName: post.author.profile.displayName ?? undefined,
      } : undefined,
    } : undefined,
    categories: post.categories.map((pc: { category: Category }) => pc.category),
    _count: post._count,
    viewCount: post.viewCount,
    tags: [], // TODO: add tags if available
    thumbnail: (post as any).thumbnail ?? undefined,
  }));

  return NextResponse.json(result);
} 