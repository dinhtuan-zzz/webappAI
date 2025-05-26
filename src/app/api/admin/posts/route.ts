import { requireAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { PostFilter as PostFilterBase } from "@/types/PostFilter";
import { mapPrismaPostToPostResponse } from '@/types/mappers';
import { createNotification } from '@/lib/notifications';
import { NotificationType } from '@/types/Notification';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import slugify from 'slugify';

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

const postCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  categoryIds: z.array(z.string()).min(1),
  status: z.string().optional(),
  thumbnail: z.string().optional(),
});

// Utility to extract mentioned usernames from content
function extractMentions(content: string): string[] {
  const matches = content.match(/@([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.slice(1).toLowerCase())));
}

function getTestSession(req: Request) {
  if (process.env.NODE_ENV === 'test') {
    const testUser = req.headers.get('x-test-user');
    if (testUser) {
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
  let session = getTestSession(req);
  if (!session) {
    session = await getServerSession(authOptions);
  }
  if (!session?.user?.id || session.user.role !== 'admin') {
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

  const where: Record<string, unknown> = {};
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
            id: true,
            username: true,
            email: true,
            role: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        _count: { select: { votes: true, comments: true } },
      },
    }),
  ]);

  return NextResponse.json({
    posts: posts.map(mapPrismaPostToPostResponse),
    total,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages: Math.ceil(total / filter.pageSize),
  });
}

/**
 * POST /api/admin/posts
 * Creates a new post (admin only). Notifies mentioned users.
 */
export async function POST(req: Request) {
  let session = getTestSession(req);
  if (!session) {
    session = await getServerSession(authOptions);
  }
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const parsed = postCreateSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }
  const { title, content, categoryIds, status, thumbnail } = parsed.data;
  const slug = slugify(title, { lower: true, strict: true });
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        status: status as any || 'PUBLISHED',
        authorId: session.user.id,
        thumbnail,
        categories: {
          create: categoryIds.map((categoryId: string) => ({ categoryId })),
        },
      },
      include: {
        author: { select: { id: true, username: true } },
        categories: { include: { category: true } },
      },
    });

    // Mention notification logic
    const mentionedUsernames = extractMentions(content);
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: {
          username: { in: mentionedUsernames, mode: 'insensitive' },
        },
        select: { id: true, username: true },
      });
      const actorName = session.user.profile?.displayName || session.user.username;
      for (const user of mentionedUsers) {
        if (user.id !== session.user.id) {
          await createNotification({
            userId: user.id,
            type: NotificationType.Mention,
            title: `${actorName} mentioned you in a post`,
            message: `You were mentioned by ${actorName}`,
            link: `/post/${post.id}`,
            data: { by: session.user.username },
          });
        }
      }
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
} 