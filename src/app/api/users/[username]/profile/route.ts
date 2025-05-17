import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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

export async function PATCH(req: Request, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { username } = params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { email, displayName, username: newUsername } = await req.json();
  try {
    // Check for email or username conflicts
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }
    if (newUsername && newUsername !== user.username) {
      const existing = await prisma.user.findUnique({ where: { username: newUsername } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "Username already in use" }, { status: 409 });
      }
    }
    // Update user and upsert profile
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        username: newUsername,
        profile: {
          upsert: {
            update: { displayName: displayName ?? "" },
            create: { displayName: displayName ?? "" },
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        profile: { select: { displayName: true, avatarUrl: true, bio: true } },
      },
    });
    return NextResponse.json({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      displayName: updated.profile?.displayName || updated.username,
      avatarUrl: updated.profile?.avatarUrl || null,
      bio: updated.profile?.bio || "",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile. Please try again." }, { status: 500 });
  }
} 