"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CommentEditor from './CommentEditor';

export function CommentForm({
  onSubmit,
  onCancel,
  initialContent = "",
  loading = false,
  submitLabel = "Post",
  requireAuth = false,
  onRequireAuth,
  canEdit = true,
}: {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  initialContent?: string;
  loading?: boolean;
  submitLabel?: string;
  requireAuth?: boolean;
  onRequireAuth?: () => void;
  canEdit?: boolean;
}) {
  const [content, setContent] = useState(initialContent);
  const [dirty, setDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDirty(content !== initialContent);
  }, [content, initialContent]);

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

  const handleCancel = () => {
    setContent(initialContent);
    setDirty(false);
    if (onCancel) onCancel();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAuth && onRequireAuth) {
      onRequireAuth();
      return;
    }
    if (content.trim()) {
      onSubmit(content.trim());
      setContent(initialContent); // Reset to initial after submit
      setDirty(false);
    }
  };

  // Debug log for canEdit and readOnly
  console.log('CommentForm canEdit:', canEdit, 'readOnly:', !canEdit || loading);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <CommentEditor
        value={content}
        onChange={setContent}
        placeholder="Write a comment..."
        readOnly={!canEdit || loading}
      />
      <div className="flex gap-2 justify-end">
        {dirty && (
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
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