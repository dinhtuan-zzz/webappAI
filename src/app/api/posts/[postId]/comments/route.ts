import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId } = await params;
  const { content, parentId } = await req.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
        parentId: parentId || null,
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
    return NextResponse.json({ comment });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
} 