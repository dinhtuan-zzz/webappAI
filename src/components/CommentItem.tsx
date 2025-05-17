"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/CommentForm";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
}: {
  comment: any;
  currentUserId?: string;
  onEdit: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onReply: (content: string) => Promise<void>;
}) {
  const [editMode, setEditMode] = useState(false);
  const [replyMode, setReplyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAuthor = currentUserId && comment.author?.id === currentUserId;
  const avatar = comment.author?.profile?.avatarUrl || "/avatar-placeholder.png";
  const displayName = comment.author?.profile?.displayName || comment.author?.username || "User";
  const timestamp = new Date(comment.createdAt).toLocaleString();

  return (
    <div className="flex gap-3 py-3 border-b border-[#e6e6e6]">
      <Image src={avatar} alt={displayName} width={32} height={32} className="rounded-full border" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-[#2a4257] text-sm">{displayName}</span>
          <span className="text-xs text-gray-400">{timestamp}</span>
        </div>
        {editMode ? (
          <CommentForm
            initialContent={comment.content}
            onSubmit={async (content) => {
              setLoading(true);
              await onEdit(content);
              setEditMode(false);
              setLoading(false);
            }}
            onCancel={() => setEditMode(false)}
            loading={loading}
            submitLabel="Save"
          />
        ) : (
          <div className="prose prose-sm max-w-none text-[#2a4257] mb-2">
            <MarkdownRenderer content={comment.content} />
          </div>
        )}
        <div className="flex gap-2 text-xs mt-1">
          {isAuthor && !editMode && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={async () => {
                  if (window.confirm("Delete this comment?")) {
                    setLoading(true);
                    await onDelete();
                    setLoading(false);
                  }
                }}
              >
                Delete
              </Button>
            </>
          )}
          {!editMode && (
            <Button variant="ghost" size="sm" onClick={() => setReplyMode((v) => !v)}>
              Reply
            </Button>
          )}
        </div>
        {replyMode && !editMode && (
          <div className="mt-2">
            <CommentForm
              onSubmit={async (content) => {
                setLoading(true);
                await onReply(content);
                setReplyMode(false);
                setLoading(false);
              }}
              onCancel={() => setReplyMode(false)}
              loading={loading}
              submitLabel="Reply"
            />
          </div>
        )}
      </div>
    </div>
  );
} 