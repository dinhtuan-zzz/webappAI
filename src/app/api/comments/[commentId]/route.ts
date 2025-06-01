import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Comment } from "@/types/Comment";
import DOMPurify from 'isomorphic-dompurify';
import { isMeaningfulHtml, enforceSafeCheckboxInputs } from '@/lib/htmlUtils';

const commentUpdateSchema = z.object({
  content: z.string().min(1).max(2000),
});

/**
 * PUT /api/comments/[commentId]
 *
 * Updates a comment's content. Only the author can update their comment.
 *
 * Backend validation:
 * - Sanitizes HTML using DOMPurify (defense in depth)
 * - Checks for meaningful content after sanitization
 * - Only allows a safe subset of tags/attributes
 *
 * @returns {Response} JSON response with the updated comment.
 */
export async function PUT(req: Request, { params }: { params: { commentId: string } }) {
  console.log('PUT request received');
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
  // Sanitize and validate content
  let sanitizedContent = DOMPurify.sanitize(parsed.data.content, {
    ALLOWED_TAGS: [
      'a', 'b', 'i', 'u', 's', 'em', 'strong', 'blockquote', 'ul', 'ol', 'li', 'pre', 'code', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'p', 'span',
      'label', 'input'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style', 'width', 'height', 'align', 'colspan', 'rowspan',
      'type', 'checked', 'data-checked', 'name', 'value', 'disabled'
    ],
    ALLOW_DATA_ATTR: true
  });
  sanitizedContent = enforceSafeCheckboxInputs(sanitizedContent);
  console.log('Sanitized comment HTML:', sanitizedContent);
  if (!isMeaningfulHtml(sanitizedContent)) {
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }
  // Check author
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const updated = await prisma.comment.update({ where: { id: commentId }, data: { content: sanitizedContent } });
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