"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export function CommentForm({
  onSubmit,
  onCancel,
  initialContent = "",
  loading = false,
  submitLabel = "Post",
  requireAuth = false,
  onRequireAuth,
}: {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  initialContent?: string;
  loading?: boolean;
  submitLabel?: string;
  requireAuth?: boolean;
  onRequireAuth?: () => void;
}) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    if (requireAuth && onRequireAuth) {
      onRequireAuth();
      // Blur to prevent typing
      textareaRef.current?.blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (requireAuth && onRequireAuth) {
      onRequireAuth();
      return;
    }
    setContent(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAuth && onRequireAuth) {
      onRequireAuth();
      return;
    }
    if (content.trim()) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        className="w-full rounded border border-[#e6e6e6] p-2 text-base min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#6bb7b7]"
        value={content}
        onFocus={handleFocus}
        onChange={handleChange}
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