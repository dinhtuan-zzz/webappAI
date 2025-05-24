import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const voteInputSchema = z.object({
  value: z.number().refine((v) => v === 1 || v === -1, {
    message: "Vote value must be 1 or -1",
  }),
});

/**
 * POST /api/posts/[postId]/vote
 *
 * Casts or removes a vote for a post. Requires authentication.
 *
 * @returns {Response} JSON response with the new vote count and user vote state.
 */
export async function POST(req: Request, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId } = params;
  const body = await req.json();
  const parsed = voteInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { value } = parsed.data;

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