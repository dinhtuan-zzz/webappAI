import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";
import { PostStatus } from "@prisma/client";
import type { Post, PostUpdateInput } from "@/types/Post";
import type { Category } from "@/types/Category";

const postUpdateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  categoryIds: z.array(z.string()).min(1),
  status: z.nativeEnum(PostStatus),
  thumbnail: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
  await requireAdmin();
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: { categories: { include: { category: true } }, author: { select: { username: true, email: true, profile: { select: { avatarUrl: true, displayName: true } } } }, _count: { select: { votes: true, comments: true } } },
  }) as any;
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const apiPost: Post = {
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
    tags: [],
    thumbnail: (post as any).thumbnail ?? undefined,
  };
  return NextResponse.json({ post: apiPost });
}

export async function PATCH(req: NextRequest, { params }: { params: { postId: string } }) {
  await requireAdmin();
  const data = await req.json();
  const parsed = postUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { title, content, categoryIds, status, thumbnail } = parsed.data;
  const post = await prisma.post.update({
    where: { id: params.postId },
    data: {
      title,
      content,
      status,
      thumbnail,
      categories: {
        deleteMany: {},
        create: categoryIds.map((categoryId: string) => ({ categoryId })),
      },
    } as any,
    include: {
      categories: { include: { category: true } },
      author: { select: { username: true, email: true, profile: { select: { avatarUrl: true, displayName: true } } } },
      _count: { select: { votes: true, comments: true } },
    },
  }) as any;
  const apiPost: Post = {
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
    tags: [],
    thumbnail: (post as any).thumbnail ?? undefined,
  };
  return NextResponse.json({ post: apiPost });
}

export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const post = await prisma.post.update({
      where: { id: params.postId },
      data: {
        status: 'TRASH',
        deletedAt: new Date(),
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SOFT_DELETE_POST',
        target: params.postId,
        createdAt: new Date(),
        meta: { title: post.title },
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to soft delete post' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { previousStatus } = await req.json();
  try {
    const post = await prisma.post.update({
      where: { id: params.postId },
      data: {
        status: previousStatus || 'PUBLISHED',
        deletedAt: null,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UNDO_SOFT_DELETE_POST',
        target: params.postId,
        createdAt: new Date(),
        meta: { title: post.title },
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to undo delete' }, { status: 500 });
  }
} 