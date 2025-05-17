"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CommentForm({
  onSubmit,
  onCancel,
  initialContent = "",
  loading = false,
  submitLabel = "Post",
}: {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  initialContent?: string;
  loading?: boolean;
  submitLabel?: string;
}) {
  const [content, setContent] = useState(initialContent);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content.trim());
            setContent("");
        }
      }}
      className="flex flex-col gap-2"
    >
      <textarea
        className="w-full rounded border border-[#e6e6e6] p-2 text-base min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#6bb7b7]"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write a comment..."
        disabled={loading}
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || !content.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
} 