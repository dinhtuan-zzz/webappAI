import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostDetails from "@/components/PostDetails";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import type { Category } from "@/types/Category";
import type { Tag } from "@/types/Post";
import PostDetailActions from "./PostDetailActions";

export default async function AdminPostViewPage({ params }: { params: { postId: string } }) {
  // Enforce admin-only access
  const session = await requireAdmin();
  if (!session) redirect("/login");

  // Fetch post with all details
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      author: { select: { username: true, email: true, profile: { select: { avatarUrl: true, displayName: true } } } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: { select: { votes: true, comments: true } },
    },
  });
  if (!post) notFound();

  // Map categories to match Post type (id and name only)
  const mappedPost = {
    ...post,
    categories: Array.isArray(post.categories)
      ? post.categories.map((cat: { category: Category }) => ({ id: cat.category.id, name: cat.category.name }))
      : undefined,
    summary: post.summary ?? undefined,
    author: post.author
      ? {
          ...post.author,
          profile: post.author.profile === null ? undefined : post.author.profile,
        }
      : undefined,
    tags: Array.isArray(post.tags)
      ? post.tags.map((pt: { tag: Tag }) => ({ id: pt.tag.id, name: pt.tag.name }))
      : undefined,
    thumbnail: post.thumbnail === null ? undefined : post.thumbnail,
  };

  // Action buttons
  const actions = (
    <PostDetailActions postId={post.id} postTitle={post.title} />
  );

  return <PostDetails post={mappedPost} actions={actions} />;
} 