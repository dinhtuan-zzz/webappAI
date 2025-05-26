import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostWithCount } from "@/types/PostWithCount";


function getTrendingScore(post: PostWithCount) {
  const now = new Date();
  const created = new Date(post.createdAt);
  const hoursSinceCreated = Math.max((now.getTime() - created.getTime()) / 36e5, 0.01); // avoid div by 0
  const votes = post._count.votes || 0;
  const comments = post._count.comments || 0;
  const views = post.viewCount || 0;
  return ((votes * 4) + (comments * 2) + (views * 2)) / (hoursSinceCreated + 2);
}

export async function GET() {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const posts = await prisma.post.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        status: "PUBLISHED",
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
        viewCount: true,
        author: {
          select: {
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        _count: {
          select: { votes: true, comments: true },
        },
      },
    });
    const normalizedPosts = posts.map(post => ({
      ...post,
      author: {
        ...post.author,
        profile: post.author.profile ?? undefined,
      },
    }));
    const scored = normalizedPosts.map(post => ({ ...post, trendingScore: getTrendingScore(post) }));
    scored.sort((a, b) => b.trendingScore - a.trendingScore);
    return NextResponse.json({ posts: scored.slice(0, 5) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch trending posts" }, { status: 500 });
  }
} 