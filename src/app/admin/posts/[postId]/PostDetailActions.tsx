"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PostDeleteDialog from "@/components/PostDeleteDialog";
import { Edit, Trash2, ArrowLeft } from "lucide-react";

export default function PostDetailActions({ postId, postTitle, onDeleted }: { postId: string, postTitle?: string, onDeleted?: () => void }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <div className="flex gap-4 items-center mt-2 justify-end">
      <Link href={`/admin/posts/${postId}/edit`}>
        <Button variant="default" aria-label="Edit post" title="Edit post">
          <Edit className="mr-1 w-4 h-4" /> Edit
        </Button>
      </Link>
      <Button
        variant="destructive"
        aria-label="Delete post"
        title="Delete post"
        className="ml-2"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="mr-1 w-4 h-4" /> Delete
      </Button>
      <PostDeleteDialog
        postId={postId}
        postTitle={postTitle}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={onDeleted}
      />
      <Link href="/admin/posts">
        <Button variant="outline" aria-label="Back to list" title="Back to list">
          <ArrowLeft className="mr-1 w-4 h-4" /> Back to list
        </Button>
      </Link>
    </div>
  );
} 