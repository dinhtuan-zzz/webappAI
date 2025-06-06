"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/CommentForm";
import DOMPurify from 'isomorphic-dompurify';
import { Avatar } from "@/components/Avatar";
import type { Comment } from "@/types/Comment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import CollapsibleComment from './CollapsibleComment';
import { TiptapJsonRenderer } from './tiptap-ui/TiptapJsonRenderer';
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

const sanitize = DOMPurify.sanitize || (DOMPurify as any).default?.sanitize;

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

export function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  optimistic,
}: {
  comment: Comment;
  currentUserId?: string;
  onEdit: (content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReply: (content: string) => Promise<void>;
  optimistic?: { saving?: boolean; error?: string; retry?: () => void };
}) {
  const [editMode, setEditMode] = useState(false);
  const [replyMode, setReplyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isAuthor = Boolean(currentUserId && comment.author?.id === currentUserId);
  const avatarUrl = comment.author?.profile?.avatarUrl;
  const email = comment.author?.email;
  const displayName = comment.author?.profile?.displayName || comment.author?.username || "User";
  const timestamp = new Date(comment.createdAt).toLocaleString();

  // Add copy button to code blocks after render
  useEffect(() => {
    if (editMode) return;
    const container = document.getElementById(`comment-content-${comment.id}`);
    if (!container) return;
    const pres = container.querySelectorAll('pre');
    pres.forEach((pre) => {
      if (pre.querySelector('.copy-btn')) return; // already added
      const btn = document.createElement('button');
      btn.textContent = 'Copy';
      btn.className = 'copy-btn absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded hover:bg-gray-700';
      btn.style.position = 'absolute';
      btn.style.top = '0.5em';
      btn.style.right = '0.5em';
      btn.onclick = () => {
        const code = pre.querySelector('code');
        if (code) {
          navigator.clipboard.writeText(code.textContent || '');
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
        }
      };
      pre.style.position = 'relative';
      pre.appendChild(btn);
      if (!pre.querySelector('.lang-label')) {
        const code = pre.querySelector('code');
        if (code) {
          const classList = code.className.split(' ');
          const langClass = classList.find(c => c.startsWith('language-'));
          if (langClass) {
            const lang = langClass.replace('language-', '');
            const label = document.createElement('span');
            label.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
            label.className = 'lang-label absolute top-2 left-2 bg-gray-800 text-gray-200 text-xs px-2 py-0.5 rounded';
            label.style.position = 'absolute';
            label.style.top = '0.5em';
            label.style.left = '0.5em';
            pre.appendChild(label);
          }
        }
      }
    });
    // Cleanup: remove buttons/labels on unmount
    return () => {
      pres.forEach((pre) => {
        const btn = pre.querySelector('.copy-btn');
        if (btn) pre.removeChild(btn);
        const label = pre.querySelector('.lang-label');
        if (label) pre.removeChild(label);
      });
    };
  }, [editMode, comment.id, comment.content]);

  useEffect(() => {
    if (editMode) return;
    const container = document.getElementById(`comment-content-${comment.id}`);
    if (!container) return;

    // Function to disable all checkboxes
    const disableCheckboxes = () => {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => cb.setAttribute('disabled', 'true'));
    };

    // Initial disable
    disableCheckboxes();

    // Observe for DOM changes
    const observer = new MutationObserver(disableCheckboxes);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [editMode, comment.id, comment.content]);

  const handleEditClick = () => {
    setEditMode(true);
    setReplyMode(false);
  };
  const handleReplyClick = () => {
    setReplyMode((v) => !v);
    setEditMode(false);
  };

  return (
    <div className="flex gap-3 py-3 border-b border-[#e6e6e6] opacity-100" style={optimistic?.saving ? { opacity: 0.6, pointerEvents: 'none' } : {}}>
      <Avatar avatarUrl={avatarUrl} email={email} name={displayName} size={32} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-[#2a4257] text-sm">{displayName}</span>
          <span className="text-xs text-gray-400">{timestamp}</span>
          {optimistic?.saving && <span className="ml-2 text-xs text-blue-500 flex items-center gap-1" role="status" aria-live="polite"><span className="animate-spin h-3 w-3 border-2 border-t-transparent border-current rounded-full" aria-hidden="true"></span>Saving…</span>}
        </div>
        {optimistic?.error && (
          <div className="text-red-500 text-xs mb-1 flex items-center gap-2" role="alert" aria-live="assertive">
            {optimistic.error}
            {optimistic.retry && (
              <button className="underline focus:outline focus:ring-2 focus:ring-blue-500" onClick={optimistic.retry} tabIndex={0} aria-label="Retry posting comment">Retry</button>
            )}
          </div>
        )}
        {editMode ? (
          <CommentForm
            key={`edit-${comment.id}-${editMode}`}
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
            canEdit={isAuthor}
            contextKey={`edit-${comment.id}`}
            autoFocus={true}
          />
        ) : (
          <CollapsibleComment maxHeight={300}>
            {injectOnToggle => (
              <div id={`comment-content-${comment.id}`}>
                <TiptapJsonRenderer content={comment.content} injectOnToggle={injectOnToggle} />
              </div>
            )}
          </CollapsibleComment>
        )}
        <div className="flex gap-2 text-xs mt-1">
          {isAuthor && !editMode && !optimistic?.saving && (
            <>
              <Button variant="ghost" size="sm" onClick={handleEditClick}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
              <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete comment?</DialogTitle>
                  </DialogHeader>
                  <div className="py-2">Are you sure you want to delete this comment? This action cannot be undone.</div>
                  <DialogFooter>
                    <Button variant="destructive" onClick={async () => { setShowDeleteConfirm(false); setLoading(true); await onDelete(comment.id); setLoading(false); }}>Delete</Button>
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          {!editMode && !optimistic?.saving && (
            <Button variant="ghost" size="sm" onClick={handleReplyClick}>
              Reply
            </Button>
          )}
        </div>
        {replyMode && !editMode && (
          <div className="mt-2">
            <CommentForm
              key={`reply-${comment.id}`}
              initialContent=""
              onSubmit={async (content) => {
                setLoading(true);
                await onReply(content);
                setReplyMode(false);
                setLoading(false);
              }}
              onCancel={() => setReplyMode(false)}
              loading={loading}
              submitLabel="Reply"
              canEdit={isAuthor}
              contextKey={`reply-${comment.id}`}
              autoFocus={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}