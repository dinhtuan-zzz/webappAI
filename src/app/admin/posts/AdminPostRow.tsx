"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Eye, Edit, Trash2 } from "lucide-react";
import PostDeleteDialog from "@/components/PostDeleteDialog";
import type { PostResponse as Post } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-200 text-gray-700",
    PUBLISHED: "bg-teal-100 text-teal-700 border-teal-300",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
    TRASH: "bg-gray-100 text-gray-400 border-gray-200",
    DELETED: "bg-gray-100 text-gray-400 border-gray-200",
  };
  return (
    <span
      className={
        "px-2 py-0.5 rounded-full border text-xs font-semibold transition-colors " +
        (STATUS_COLORS[status] || "bg-gray-100 text-gray-500 border-gray-200")
      }
      aria-label={status}
    >
      {status}
    </span>
  );
}

export default function AdminPostRow({ post, idx, page, onDeleted, onUndo }: { post: Post; idx: number; page: number; onDeleted: () => void; onUndo: () => void }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <>
      <td className="p-3 align-middle">{(page - 1) * 10 + idx + 1}</td>
      <td className="p-3 align-middle max-w-xs">
        <span className="font-semibold line-clamp-2">{post.title}</span>
        <div className="text-xs text-gray-400 line-clamp-1">{post.slug}</div>
      </td>
      <td className="p-3 align-middle flex items-center gap-2">
        {post.author?.profile?.avatarUrl && (
          <Image
            src={post.author.profile.avatarUrl}
            alt={post.author.profile.displayName || post.author.username || "Tác giả"}
            className="w-7 h-7 rounded-full border border-gray-200 object-cover bg-white"
            width={28}
            height={28}
            loading="lazy"
          />
        )}
        <span className="font-medium">{post.author?.profile?.displayName || post.author?.username || "-"}</span>
      </td>
      <td className="p-3 align-middle whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString()}</td>
      <td className="p-3 align-middle">
        <StatusBadge status={post.status} />
      </td>
      <td className="p-3 align-middle text-center">{post.viewCount ?? 0}</td>
      <td className="p-3 align-middle flex gap-2">
        <Link href={`/admin/posts/${post.id}`} aria-label="Xem chi tiết bài viết">
          <Tooltip content="Xem chi tiết bài viết">
            <Button size="icon" variant="ghost" aria-label="Xem chi tiết bài viết">
              <Eye className="w-5 h-5 text-sky-500" />
            </Button>
          </Tooltip>
        </Link>
        <Link href={`/admin/posts/${post.id}/edit`}>
          <Tooltip content="Sửa bài viết">
            <Button size="icon" variant="ghost" aria-label="Sửa bài viết">
              <Edit className="w-5 h-5 text-green-500" />
            </Button>
          </Tooltip>
        </Link>
        <Tooltip content="Xóa bài viết">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Xóa bài viết"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </Button>
        </Tooltip>
        <PostDeleteDialog
          postId={post.id}
          postTitle={post.title}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDeleted={onDeleted}
          onUndo={onUndo}
        />
      </td>
    </>
  );
} 