import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";
import { PostStatus } from "@prisma/client";
import type { PostUpdateInput } from "@/types/Post";
import { mapPrismaPostToPostResponse } from '@/types/mappers';
import { createNotification } from '@/lib/notifications';
import { NotificationType } from '@/types/Notification';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const postUpdateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  categoryIds: z.array(z.string()).min(1),
  status: z.nativeEnum(PostStatus),
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

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
  await requireAdmin();
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      categories: { include: { category: true } },
      author: { select: { id: true, username: true, email: true, role: true, profile: { select: { avatarUrl: true, displayName: true } } } },
      tags: { include: { tag: true } },
      _count: { select: { votes: true, comments: true } },
    },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post: mapPrismaPostToPostResponse(post) });
}

export async function PATCH(req: NextRequest, { params }: { params: { postId: string } }) {
  let session = getTestSession(req);
  if (!session) {
    session = await getServerSession(authOptions);
  }
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data: PostUpdateInput = await req.json();
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
      ...(thumbnail !== undefined ? { thumbnail } : {}),
      categories: {
        deleteMany: {},
        create: categoryIds.map((categoryId: string) => ({ categoryId })),
      },
    } as any,
    include: {
      categories: { include: { category: true } },
      author: { select: { id: true, username: true } },
      tags: { include: { tag: true } },
      _count: { select: { votes: true, comments: true } },
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

  return NextResponse.json({ post: mapPrismaPostToPostResponse(post) });
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