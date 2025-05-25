"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/CommentForm";
import DOMPurify from 'dompurify';
import { Avatar } from "@/components/Avatar";
import type { Comment } from "@/types/Comment";

export function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
}: {
  comment: Comment;
  currentUserId?: string;
  onEdit: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onReply: (content: string) => Promise<void>;
}) {
  const [editMode, setEditMode] = useState(false);
  const [replyMode, setReplyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAuthor = currentUserId && comment.author?.id === currentUserId;
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

  return (
    <div className="flex gap-3 py-3 border-b border-[#e6e6e6]">
      <Avatar avatarUrl={avatarUrl} email={email} name={displayName} size={32} />
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
          <div
            id={`comment-content-${comment.id}`}
            className="prose prose-editor max-w-none mb-2"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content || '', {
              ALLOWED_TAGS: [
                'a', 'b', 'i', 'u', 's', 'em', 'strong', 'blockquote', 'ul', 'ol', 'li', 'pre', 'code', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'p', 'span'
              ],
              ALLOWED_ATTR: [
                'href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style', 'width', 'height', 'align', 'colspan', 'rowspan'
              ],
              ALLOW_DATA_ATTR: true
            }) }}
          />
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