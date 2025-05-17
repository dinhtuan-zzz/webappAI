import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PostCard } from "@/components/ui/PostCard";
import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ProfileTabs({ posts, loadingPosts, username }: {
  posts: any[], loadingPosts: boolean, username: string
}) {
  const [commentsPage, setCommentsPage] = useState(1);
  const COMMENTS_LIMIT = 10;
  const { data: commentsData, isLoading: loadingComments } = useSWR(
    username ? `/api/users/${username}/comments?page=${commentsPage}&limit=${COMMENTS_LIMIT}` : null,
    (url) => fetch(url).then(res => res.json())
  );
  const comments = commentsData?.comments || [];
  const totalPages = commentsData?.totalPages || 1;
  const total = commentsData?.total || 0;

  return (
    <Tabs defaultValue="posts">
      <TabsList>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
      </TabsList>
      <TabsContent value="posts">
        {loadingPosts ? (
          <div>Loading posts...</div>
        ) : posts?.length ? (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div>No posts yet.</div>
        )}
      </TabsContent>
      <TabsContent value="comments">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-base">{total} comment{total === 1 ? "" : "s"}</span>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setCommentsPage(p => p - 1)} disabled={commentsPage === 1 || loadingComments}>&larr; Prev</Button>
              <span className="text-xs px-2">Page {commentsPage} / {totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setCommentsPage(p => p + 1)} disabled={commentsPage === totalPages || loadingComments}>Next &rarr;</Button>
            </div>
          )}
        </div>
        {loadingComments ? (
          <div>Loading comments...</div>
        ) : comments.length ? (
          <ul className="space-y-4">
            {comments.map((comment: any) => (
              <li key={comment.id} className="border rounded p-3 bg-muted/50 shadow-sm">
                <div className="text-sm mb-1">{comment.content}</div>
                <div className="text-xs text-muted-foreground flex gap-2">
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  <span>on <Link href={`/post/${comment.post.slug}`} className="underline hover:text-primary font-medium">{comment.post.title}</Link></span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div>No comments yet.</div>
        )}
      </TabsContent>
    </Tabs>
  );
} 