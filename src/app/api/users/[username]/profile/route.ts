import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import type { User } from "@/types/User";

const profilePatchSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().max(100).optional(),
  username: z.string().min(3).max(32).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(100).optional(),
});

/**
 * GET /api/users/[username]/profile
 *
 * Returns the public profile for a user.
 *
 * @returns {Response} JSON response with the user's profile.
 */
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
  const result: User & {
    displayName: string;
    avatarUrl: string | null;
    bio: string;
    joined: Date;
    postCount: number;
    commentCount: number;
  } = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: "user",
    displayName: (user.profile?.displayName === null || user.profile?.displayName === undefined) ? user.username : user.profile.displayName,
    avatarUrl: user.profile?.avatarUrl ?? "",
    bio: user.profile?.bio || "",
    joined: user.createdAt,
    postCount: user._count.posts,
    commentCount: user._count.comments,
  };
  return NextResponse.json(result);
}

/**
 * PATCH /api/users/[username]/profile
 *
 * Updates the profile for the authenticated user.
 *
 * @returns {Response} JSON response with the updated profile.
 */
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
  const body = await req.json();
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { email, displayName, username: newUsername, currentPassword, newPassword } = parsed.data;
  try {
    // Password change logic
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Both current and new password are required." }, { status: 400 });
      }
      if (!user.password) {
        return NextResponse.json({ error: "Password change not supported for this account." }, { status: 400 });
      }
      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
      const hashed = await hash(newPassword, 10);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
      return NextResponse.json({ success: true, message: "Password changed successfully." });
    }
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
    const result: User & {
      displayName: string;
      avatarUrl: string | null;
      bio: string;
    } = {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      role: "user",
      displayName: (updated.profile?.displayName === null || updated.profile?.displayName === undefined) ? updated.username : updated.profile.displayName,
      avatarUrl: updated.profile?.avatarUrl ?? "",
      bio: updated.profile?.bio || "",
    };
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile. Please try again." }, { status: 500 });
  }
} 