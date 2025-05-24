import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Comment } from "@/types/Comment";

const commentUpdateSchema = z.object({
  content: z.string().min(1).max(2000),
});

/**
 * PUT /api/comments/[commentId]
 *
 * Updates a comment's content. Only the author can update their comment.
 *
 * @returns {Response} JSON response with the updated comment.
 */
export async function PUT(req: Request, { params }: { params: { commentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { commentId } = params;
  const body = await req.json();
  const parsed = commentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  // Check author
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const updated = await prisma.comment.update({ where: { id: commentId }, data: { content: parsed.data.content } });
    const result: Pick<Comment, "id" | "content"> = { id: updated.id, content: updated.content };
    return NextResponse.json({ comment: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

/**
 * DELETE /api/comments/[commentId]
 *
 * Deletes a comment. Only the author can delete their comment.
 *
 * @returns {Response} JSON response with success boolean.
 */
export async function DELETE(req: Request, { params }: { params: { commentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { commentId } = params;
  // Check author
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await prisma.comment.delete({ where: { id: commentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
} 