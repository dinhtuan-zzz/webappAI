import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostDetails from "@/components/PostDetails";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

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
      tags: true,
      _count: { select: { votes: true, comments: true } },
    },
  });
  if (!post) notFound();

  // Map categories to match Post type (id and name only)
  const mappedPost = {
    ...post,
    categories: Array.isArray(post.categories)
      ? post.categories.map((cat: any) => ({ id: cat.category.id, name: cat.category.name }))
      : undefined,
    summary: post.summary ?? undefined,
    author: post.author
      ? {
          ...post.author,
          profile: post.author.profile === null ? undefined : post.author.profile,
        }
      : undefined,
    tags: Array.isArray(post.tags)
      ? post.tags.map((tag: any) => ({ id: tag.id, name: tag.name }))
      : undefined,
  };

  // Action buttons
  const actions = (
    <div className="flex gap-2">
      <Link href={`/admin/posts/${post.id}/edit`}>
        <Button variant="outline" aria-label="Edit post">Edit</Button>
      </Link>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" aria-label="Delete post">Delete</Button>
        </DialogTrigger>
        <DialogContent>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Delete Post?</h2>
            <p className="mb-4">Are you sure you want to delete this post? This action cannot be undone.</p>
            <form method="post" action={`/api/admin/posts/${post.id}/delete`}>
              <div className="flex gap-2 justify-end">
                <Button type="submit" variant="destructive" aria-label="Confirm delete">Confirm Delete</Button>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogTrigger>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      <Link href="/admin/posts">
        <Button variant="secondary" aria-label="Back to list">Back to list</Button>
      </Link>
    </div>
  );

  return <PostDetails post={mappedPost} actions={actions} />;
} 