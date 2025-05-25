import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Post } from "@/types/Post";
import type { Category } from "@/types/Category";
import type { PostFilter } from "@/types/PostFilter";

/**
 * GET /api/posts
 *
 * Fetches a list of posts for the public/landing page, including author, tags, vote/comment counts, view count, and categories.
 *
 * @returns {Response} JSON response with an array of posts.
 *
 * Each post includes:
 * - id, slug, title, summary, content, createdAt
 * - author (username, profile)
 * - tags (with tag info)
 * - _count (votes, comments)
 * - viewCount
 * - categories: [{ category: { id: string } }]
 */
export async function GET(req: Request) {
  try {
    const postFilterSchema = z.object({
      search: z.string().optional(),
      status: z.string().optional(),
      date: z.string().optional(),
      categoryIds: z.string().optional(), // comma-separated
      page: z.string().optional(),
      pageSize: z.string().optional(),
    });

    const { searchParams } = new URL(req.url);
    const parsed = postFilterSchema.parse(Object.fromEntries(searchParams.entries()));
    const filter: PostFilter = {
      ...parsed,
      categoryIds: parsed.categoryIds ? parsed.categoryIds.split(",") : undefined,
      page: parsed.page ? parseInt(parsed.page, 10) : 1,
      pageSize: parsed.pageSize ? parseInt(parsed.pageSize, 10) : 10,
    };

    const where: any = {};
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: "insensitive" } },
        { content: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    if (filter.categoryIds && filter.categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: filter.categoryIds },
        },
      };
    }

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
    return NextResponse.json({ posts: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
} 