import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Comment } from "@/types/Comment";

const commentCreateSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional().nullable(),
});

/**
 * POST /api/posts/[postId]/comments
 *
 * Creates a new comment on a post. Requires authentication.
 *
 * @returns {Response} JSON response with the created comment.
 */
export async function POST(req: Request, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId } = params;
  const body = await req.json();
  const parsed = commentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        postId,
        authorId: session.user.id,
        parentId: parsed.data.parentId || null,
        status: "APPROVED",
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        parentId: true,
        author: {
          select: {
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
            id: true,
          },
        },
      },
    });
    const result: Comment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      parentId: comment.parentId,
      author: {
        username: comment.author.username,
        id: comment.author.id,
        profile: comment.author.profile
          ? {
              displayName: comment.author.profile.displayName === null ? undefined : comment.author.profile.displayName,
              avatarUrl: comment.author.profile.avatarUrl === null ? undefined : comment.author.profile.avatarUrl,
            }
          : undefined,
      },
    };
    return NextResponse.json({ comment: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
} 