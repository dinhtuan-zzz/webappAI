import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { CommentThread, Comment as CommentType } from "@/components/CommentThread";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { PostVote } from "@/components/PostVote";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { CommentsSection } from "./CommentsSection";
import { ViewCount } from "./ViewCount";
import { Avatar } from "@/components/Avatar";

function nestComments(comments: any[]): CommentType[] {
  const map = new Map();
  const roots: CommentType[] = [];
  comments.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });
  comments.forEach((c) => {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId).children.push(map.get(c.id));
    } else {
      roots.push(map.get(c.id));
    }
  });
  return roots;
}

export default async function BlogDetailPage(props: { params: { slug: string } } | Promise<{ params: { slug: string } }>) {
  // Await props if it's a Promise (Next.js 15+)
  const resolvedProps = await Promise.resolve(props);
  const params = await Promise.resolve(resolvedProps.params);
  const { slug } = params;

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      title: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          email: true,
          username: true,
          profile: { select: { avatarUrl: true, displayName: true } },
        },
      },
      tags: { include: { tag: true } },
      id: true,
      votes: { select: { value: true, userId: true } },
      viewCount: true,
      thumbnail: true,
    },
  });
  if (!post) return <div>Not found</div>;

  const authorName = post.author?.profile?.displayName || post.author?.username || "Unknown";
  const thumbnail = post.thumbnail || "/blog-thumb-placeholder.jpg";
  const content = typeof post.content === "string" ? post.content : "";
  const voteCount = post.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0);

  // Get current user's vote
  let userVote: 0 | 1 | -1 = 0;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  if (session?.user && session.user.id) {
    const userVoteObj = post.votes.find((v: any) => v.userId === session.user.id);
    if (userVoteObj && (userVoteObj.value === 1 || userVoteObj.value === -1)) {
      userVote = userVoteObj.value;
    } else {
      userVote = 0;
    }
  }

  // Fetch comments for this post
  const commentsRaw = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      parentId: true,
      author: {
        select: {
          email: true,
          username: true,
          profile: { select: { displayName: true, avatarUrl: true } },
          id: true,
        },
      },
    },
  });
  const comments = nestComments(commentsRaw);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#f7fafc] via-[#e6f0f7] to-[#f3f7f4] py-8 px-2">
      <article className="bg-white/95 dark:bg-[#23272f] rounded-xl shadow-lg max-w-2xl w-full p-6 border border-[#e6e6e6] flex flex-col gap-6">
        <div className="relative w-full h-56 rounded-lg overflow-hidden mb-2">
          <Image src={thumbnail} alt={post.title} fill className="object-cover" sizes="100vw" />
        </div>
        <h1 className="text-3xl font-bold text-[#2a4257] mb-2">{post.title}</h1>
        <div className="flex items-center gap-3 mb-2">
          <Avatar
            avatarUrl={post.author?.profile?.avatarUrl}
            email={post.author?.email}
            name={authorName}
            size={32}
          />
          <span className="text-sm text-[#2a4257] font-medium">{authorName}</span>
          <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
          <ViewCount postId={post.id} initialCount={post.viewCount || 0} />
        </div>
        <div className="mb-4">
          <PostVote postId={post.id} initialCount={voteCount} initialUserVote={userVote} />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((pt: any) => (
            <span key={pt.tag.id} className="bg-[#e6f0f7] text-[#2a4257] px-2 py-1 rounded text-xs font-medium">
              #{pt.tag.name}
            </span>
          ))}
        </div>
        <div className="prose prose-lg max-w-none text-[#2a4257] dark:text-gray-100">
          <MarkdownRenderer content={content} />
        </div>
        <hr className="my-8 border-[#e6e6e6]" />
        <CommentsSection postId={post.id} initialComments={comments} currentUserId={currentUserId} />
        <Link href="/" className="text-[#6bb7b7] hover:underline text-sm mt-4">← Back to blogs</Link>
      </article>
    </div>
  );
} 