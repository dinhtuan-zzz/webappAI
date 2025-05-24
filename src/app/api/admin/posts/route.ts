import { requireAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { z } from "zod";
import type { PostFilter as PostFilterBase } from "@/types/PostFilter";

// Helper to parse date filter
function getDateRange(date: string | undefined) {
  const now = new Date();
  if (!date || date === "all") return undefined;
  if (date === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { gte: start };
  }
  if (date === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return { gte: start };
  }
  if (date === "month") {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);
    return { gte: start };
  }
  if (date === "year") {
    const start = new Date(now);
    start.setFullYear(now.getFullYear() - 1);
    return { gte: start };
  }
  return undefined;
}

const postFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  categoryIds: z.string().optional(), // comma-separated
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

// Make page and pageSize required for this API
interface PostFilter extends Omit<PostFilterBase, 'page' | 'pageSize'> {
  page: number;
  pageSize: number;
}

/**
 * GET /api/admin/posts
 *
 * Fetches a paginated, filterable list of posts for the admin panel.
 *
 * Query parameters:
 * - search: string (search by title, content, author)
 * - status: string (post status)
 * - date: string (date filter: today, week, month, year, all)
 * - categoryIds: string (comma-separated category IDs; OR logic)
 * - page: number (page number)
 * - pageSize: number (posts per page)
 *
 * @returns {Response} JSON response with posts, total, page, pageSize, totalPages.
 *
 * Each post includes:
 * - id, slug, title, summary, content, createdAt, status, author, _count, viewCount, categories
 */
export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      { author: { username: { contains: filter.search, mode: "insensitive" } } },
    ];
  }
  if (filter.status) {
    where.status = filter.status;
  }
  const dateRange = getDateRange(filter.date);
  if (dateRange) {
    where.createdAt = dateRange;
  }
  if (filter.categoryIds && filter.categoryIds.length > 0) {
    where.categories = {
      some: {
        categoryId: { in: filter.categoryIds },
      },
    };
  }

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize,
      include: {
        author: {
          select: {
            username: true,
            email: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        _count: { select: { votes: true, comments: true } },
        categories: { select: { category: { select: { id: true } } } },
      },
    }),
  ]);

  return NextResponse.json({
    posts,
    total,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages: Math.ceil(total / filter.pageSize),
  });
} 