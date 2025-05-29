import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Comment } from "@/types/Comment";
import { createNotification } from '@/lib/notifications';
import { NotificationType } from '@/types/Notification';
import DOMPurify from 'isomorphic-dompurify';
import { isMeaningfulHtml } from '@/lib/htmlUtils';

const commentCreateSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional().nullable(),
});

// Utility to extract mentioned usernames from content
function extractMentions(content: string): string[] {
  const matches = content.match(/@([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  // Remove the @ and deduplicate
  return Array.from(new Set(matches.map(m => m.slice(1).toLowerCase())));
}

function getTestSession(req: Request) {
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
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
 * POST /api/posts/[postId]/comments
 *
 * Creates a new comment on a post. Requires authentication.
 *
 * Backend validation:
 * - Sanitizes HTML using DOMPurify (defense in depth)
 * - Checks for meaningful content after sanitization
 * - Only allows a safe subset of tags/attributes
 *
 * @returns {Response} JSON response with the created comment.
 */
export async function POST(req: Request, { params }: { params: { postId: string } }) {
  console.log(
    'DEBUG TEST BYPASS:',
    'NODE_ENV:', process.env.NODE_ENV,
    'x-test-user:', req.headers.get('x-test-user')
  );
  let session = getTestSession(req);
  if (!session) {
    session = await getServerSession(authOptions);
  }
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId } = await params;
  const body = await req.json();
  const parsed = commentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  // Sanitize and validate content
  const sanitizedContent = DOMPurify.sanitize(parsed.data.content, {
    ALLOWED_TAGS: [
      'a', 'b', 'i', 'u', 's', 'em', 'strong', 'blockquote', 'ul', 'ol', 'li', 'pre', 'code', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'p', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style', 'width', 'height', 'align', 'colspan', 'rowspan'
    ],
    ALLOW_DATA_ATTR: true
  });
  if (!isMeaningfulHtml(sanitizedContent)) {
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }
  try {
    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
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

    // Notification logic
    if (!parsed.data.parentId) {
      // Top-level comment: notify post author (if not self)
      const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true, title: true } });
      if (post && post.authorId !== session.user.id) {
        const actorName = comment.author.profile?.displayName || comment.author.username;
        await createNotification({
          userId: post.authorId,
          type: NotificationType.Reply,
          title: `${actorName} commented on your post`,
          message: `${actorName} commented on your post "${post.title}"`,
          link: `/post/${postId}#${comment.id}`,
        });
      }
    } else {
      // Reply: notify parent comment author (if not self)
      const parent = await prisma.comment.findUnique({ where: { id: parsed.data.parentId }, select: { authorId: true } });
      if (parent && parent.authorId !== session.user.id) {
        const actorName = comment.author.profile?.displayName || comment.author.username;
        await createNotification({
          userId: parent.authorId,
          type: NotificationType.Reply,
          title: `${actorName} replied to your comment`,
          message: `${actorName} replied to your comment on post`,
          link: `/post/${postId}#${comment.id}`,
        });
      }
    }

    // Mention notification logic
    const mentionedUsernames = extractMentions(parsed.data.content);
    if (mentionedUsernames.length > 0) {
      // Find users by username (case-insensitive)
      const mentionedUsers = await prisma.user.findMany({
        where: {
          username: { in: mentionedUsernames, mode: 'insensitive' },
        },
        select: { id: true, username: true },
      });
      for (const user of mentionedUsers) {
        if (user.id !== session.user.id) {
          await createNotification({
            userId: user.id,
            type: NotificationType.Mention,
            title: 'You were mentioned in a comment',
            message: `You were mentioned by @${comment.author.username}`,
            link: `/post/${postId}#${comment.id}`,
            data: { by: comment.author.username },
          });
        }
      }
    }

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