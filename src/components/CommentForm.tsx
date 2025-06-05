"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EditorContent, useEditor } from '@tiptap/react';
import { generateHTML } from '@tiptap/core';
import DOMPurify from 'isomorphic-dompurify';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import SpoilerBlock from '@/components/tiptap-ui/spoiler-block';
import CommentEditor from './CommentEditor';

const tiptapExtensions = [
  StarterKit,
  Underline,
  Link,
  ImageExtension,
  TextStyle,
  Color,
  FontFamily,
  Highlight,
  TaskList,
  TaskItem,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  Youtube,
  TextAlign,
  SpoilerBlock,
];

export function CommentForm({
  onSubmit,
  onCancel,
  initialContent = {},
  loading = false,
  submitLabel = "Post",
  requireAuth = false,
  onRequireAuth,
  canEdit = true,
  contextKey = "default",
  autoFocus = false,
}: {
  onSubmit: (content: any) => void;
  onCancel?: () => void;
  initialContent?: any;
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
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved && saved !== initialContent) {
      setContent(saved);
    }
    // eslint-disable-next-line
  }, [draftKey]);

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

  useEffect(() => {
    setMounted(true); // Only mount editor on client
  }, []);

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
    if (!content || !content.content || content.content.length === 0) {
      setError("Comment cannot be empty.");
      return;
    }
    try {
      await onSubmit(content);
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

  // Deferred remount logic with microtask
  const handlePreviewToggle = () => {
    if (showPreview) {
      setShowEditor(false);
      setShowPreview(false);
      queueMicrotask(() => setShowEditor(true)); // Use microtask for remount
    } else {
      setShowPreview(true);
      setShowEditor(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2" aria-label="Comment form">
        <div className="flex gap-2 justify-end mb-2">
          <Button type="button" variant="outline" onClick={handlePreviewToggle}>
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
        {showPreview ? (
          <div className="tiptap-preview tiptap-editor p-4 min-h-[120px] border rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generateHTML(content || { type: 'doc', content: [] }, tiptapExtensions)) }} />
          </div>
        ) : (
          mounted && showEditor && (
            <CommentEditor
              value={content}
              onChange={setContent}
              placeholder="Write a comment..."
              readOnly={!canEdit || loading}
              autoFocus={autoFocus}
            />
          )
        )}
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
          <Button type="submit" disabled={loading || !content || !content.content || content.content.length === 0}>
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

// Client-only wrapper to avoid SSR/hydration issues with Tiptap
const ClientOnlyCommentForm = (props: any) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <CommentForm {...props} />;
};
export default ClientOnlyCommentForm; 