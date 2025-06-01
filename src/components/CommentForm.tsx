"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Utility to check if HTML content is truly empty (no text, only tags/whitespace)
function isHtmlMeaningful(html: string): boolean {
  if (!html) return false;
  // Remove tags, decode entities, trim
  const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 0;
}

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false });

export function CommentForm({
  onSubmit,
  onCancel,
  initialContent = "",
  loading = false,
  submitLabel = "Post",
  requireAuth = false,
  onRequireAuth,
  canEdit = true,
  contextKey = "default", // new prop for draft key context
  autoFocus = false,
}: {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  initialContent?: string;
  loading?: boolean;
  submitLabel?: string;
  requireAuth?: boolean;
  onRequireAuth?: () => void;
  canEdit?: boolean;
  contextKey?: string;
  autoFocus?: boolean;
}) {
  const [content, setContent] = useState(initialContent);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const draftKey = `comment-draft-${contextKey}`;
  const [showConfirm, setShowConfirm] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved && saved !== initialContent) {
      setContent(saved);
    }
    // eslint-disable-next-line
  }, [draftKey]);

  // Save draft on change (debounced)
  useEffect(() => {
    if (dirty && isHtmlMeaningful(content)) {
      const handler = setTimeout(() => {
        localStorage.setItem(draftKey, content);
      }, 400);
      return () => clearTimeout(handler);
    } else if (!isHtmlMeaningful(content)) {
      localStorage.removeItem(draftKey);
    }
  }, [content, dirty, draftKey]);

  // Track dirty state
  useEffect(() => {
    setDirty(content !== initialContent && isHtmlMeaningful(content));
  }, [content, initialContent]);

  // Navigation warning
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "You have an unsaved comment. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  const handleCancel = () => {
    if (dirty) {
      setShowConfirm(true);
    } else {
      setContent(initialContent);
      setDirty(false);
      setError(null);
      localStorage.removeItem(draftKey);
      if (onCancel) onCancel();
    }
  };

  const actuallyCancel = () => {
    setShowConfirm(false);
    setContent(initialContent);
    setDirty(false);
    setError(null);
    localStorage.removeItem(draftKey);
    if (onCancel) onCancel();
  };

  // Add Esc key support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (requireAuth && onRequireAuth) {
      onRequireAuth();
      return;
    }
    if (!isHtmlMeaningful(content)) {
      setError("Comment cannot be empty.");
      return;
    }
    try {
      await onSubmit(content.trim());
      setContent(initialContent); // Reset to initial after submit
      setDirty(false);
      setError(null);
      localStorage.removeItem(draftKey);
    } catch (err: any) {
      setError(err?.message || "Failed to submit comment. Please try again.");
      if (liveRegionRef.current) {
        liveRegionRef.current.focus();
      }
    }
  };

  // Image upload handler for Tiptap
  const handleImageUpload = async (file: File): Promise<string> => {
    // Validate type and size (max 2MB)
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed.");
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Image must be less than 2MB.");
    }
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Upload failed");
    }
    const data = await res.json();
    return data.url;
  };

  // Debug log for canEdit and readOnly
  console.log('CommentForm canEdit:', canEdit, 'readOnly:', !canEdit || loading);

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2" aria-label="Comment form">
        <CommentEditor
          value={content}
          onChange={setContent}
          placeholder="Write a comment..."
          readOnly={!canEdit || loading}
          autoFocus={autoFocus}
        />
        <div
          ref={liveRegionRef}
          aria-live="assertive"
          aria-atomic="true"
          tabIndex={-1}
          className="text-red-500 text-sm min-h-[1.5em]"
          style={{ outline: 'none' }}
        >
          {error}
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !isHtmlMeaningful(content)}>
            {loading ? <span className="inline-flex items-center gap-1"><span className="animate-spin h-4 w-4 border-2 border-t-transparent border-current rounded-full"></span>Submitting...</span> : submitLabel}
          </Button>
        </div>
      </form>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard your changes?</DialogTitle>
          </DialogHeader>
          <div className="py-2">You have unsaved changes. Are you sure you want to discard them?</div>
          <DialogFooter>
            <Button variant="destructive" onClick={actuallyCancel}>Discard</Button>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Continue Editing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 