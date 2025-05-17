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
  const { value } = await req.json();
  if (![1, -1].includes(value)) {
    return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
  }

  try {
    // Find existing vote
    const existing = await prisma.vote.findFirst({
      where: { userId: session.user.id, postId },
    });

    let userVote = 0;

    if (!existing) {
      // No vote yet: create new
      await prisma.vote.create({
        data: { userId: session.user.id, postId, value },
      });
      userVote = value;
    } else {
      // Any click when already voted removes the vote
      await prisma.vote.delete({ where: { id: existing.id } });
      userVote = 0;
    }

    // Get new vote count
    const votes = await prisma.vote.findMany({ where: { postId } });
    const count = votes.reduce((sum, v) => sum + v.value, 0);

    return NextResponse.json({ count, userVote });
  } catch (error) {
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
} 