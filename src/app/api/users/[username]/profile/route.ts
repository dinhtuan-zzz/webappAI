import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
          bio: true,
        },
      },
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.profile?.displayName || user.username,
    avatarUrl: user.profile?.avatarUrl || null,
    bio: user.profile?.bio || "",
    joined: user.createdAt,
    postCount: user._count.posts,
    commentCount: user._count.comments,
  });
} 