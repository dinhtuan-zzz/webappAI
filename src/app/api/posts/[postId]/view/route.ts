import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const post = await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
    return NextResponse.json({ viewCount: post.viewCount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 });
  }
} 