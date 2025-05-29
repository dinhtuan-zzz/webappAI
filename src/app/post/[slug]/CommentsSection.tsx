"use client";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { CommentForm } from "@/components/CommentForm";
import { CommentThread } from "@/components/CommentThread";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CommentsSection({ postId, initialComments, currentUserId }: {
  postId: string;
  initialComments: any[];
  currentUserId?: string;
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [optimisticMap, setOptimisticMap] = useState<Record<string, { error?: string; saving?: boolean; retry?: () => void }>>({});
  const [undoQueue, setUndoQueue] = useState<{ comment: any; timer: NodeJS.Timeout; toastId: any; parentId: string | null; index: number }[]>([]);

  // Handler to add a new top-level comment (optimistic)
  const handleAddComment = async (content: string, retryId?: string) => {
    const tempId = retryId || `temp-${uuidv4()}`;
    const optimisticComment = {
      id: tempId,
      content,
      createdAt: new Date().toISOString(),
      parentId: null,
      author: session?.user ? {
        username: session.user.username,
        id: session.user.id,
        profile: (session.user as any)?.profile || {},
      } : {},
      children: [],
    };
    if (!retryId) setComments((prev: any[]) => [...prev, optimisticComment]);
    setOptimisticMap((prev) => ({ ...prev, [tempId]: { saving: true } }));
    // Scroll to the optimistic comment after DOM update
    setTimeout(() => {
      const el = document.getElementById(`comment-${tempId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev: any[]) => prev.map(c => c.id === tempId ? { ...data.comment, children: [] } : c));
        setOptimisticMap((prev) => {
          const { [tempId]: _, ...rest } = prev;
          return rest;
        });
        // Scroll to the real comment after replacing tempId
        setTimeout(() => {
          const el = document.getElementById(`comment-${data.comment.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        setOptimisticMap((prev) => ({ ...prev, [tempId]: { error: data.error || 'Failed to post comment.', retry: () => handleAddComment(content, tempId) } }));
      }
    } catch (e) {
      setOptimisticMap((prev) => ({ ...prev, [tempId]: { error: 'Network error. Try again.', retry: () => handleAddComment(content, tempId) } }));
    }
  };

  // Handler to edit a comment (optimistic)
  const handleEdit = async (commentId: string, content: string, retryData?: { oldContent: string }) => {
    // Optimistically update UI
    setComments((prev: any[]) => updateCommentContent(prev, commentId, content));
    setOptimisticMap((prev) => ({ ...prev, [commentId]: { saving: true } }));
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setOptimisticMap((prev) => {
          const { [commentId]: _, ...rest } = prev;
          return rest;
        });
      } else {
        setComments((prev: any[]) => updateCommentContent(prev, commentId, retryData?.oldContent || ''));
        setOptimisticMap((prev) => ({ ...prev, [commentId]: { error: 'Failed to edit comment.', retry: () => handleEdit(commentId, content, { oldContent: retryData?.oldContent || '' }) } }));
      }
    } catch (e) {
      setComments((prev: any[]) => updateCommentContent(prev, commentId, retryData?.oldContent || ''));
      setOptimisticMap((prev) => ({ ...prev, [commentId]: { error: 'Network error. Try again.', retry: () => handleEdit(commentId, content, { oldContent: retryData?.oldContent || '' }) } }));
    }
  };

  // Handler to delete a comment (optimistic, with undo toast)
  const handleDelete = async (commentId: string, retryData?: { comment: any }) => {
    // Optimistically remove from UI
    const deletedComment = findComment(comments, commentId);
    let parentId = deletedComment?.parentId || null;
    let index = -1;
    if (parentId) {
      const parent = findComment(comments, parentId);
      if (parent && parent.children) {
        index = parent.children.findIndex((c: any) => c.id === commentId);
      }
    } else {
      index = comments.findIndex((c: any) => c.id === commentId);
    }
    setComments((prev: any[]) => removeComment(prev, commentId));
    setOptimisticMap((prev) => ({ ...prev, [commentId]: { saving: true } }));
    // Show undo toast
    const toastId = toast.success(
      <span>
        Comment deleted.
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 underline"
          onClick={() => handleUndo(commentId)}
          aria-label="Undo delete comment"
        >
          Undo
        </Button>
      </span>,
      { duration: 8000 }
    );
    // Finalize delete after timeout
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
        setOptimisticMap((prev) => {
          const { [commentId]: _, ...rest } = prev;
          return rest;
        });
      } catch (e) {
        setComments((prev: any[]) => restoreComment(prev, commentId, deletedComment, parentId, index));
        setOptimisticMap((prev) => ({ ...prev, [commentId]: { error: 'Network error. Try again.', retry: () => handleDelete(commentId, { comment: deletedComment }) } }));
      }
      toast.dismiss(toastId);
    }, 8000);
    setUndoQueue((prev) => [...prev, { comment: deletedComment, timer, toastId, parentId, index }]);
  };

  // Undo handler for toast
  const handleUndo = (commentId: string) => {
    setUndoQueue((prev) => {
      const undoItem = prev.find((u) => u.comment.id === commentId);
      if (undoItem) {
        clearTimeout(undoItem.timer);
        setComments((comments) => restoreComment(comments, commentId, undoItem.comment, undoItem.parentId, undoItem.index));
        setOptimisticMap((optimisticMap) => {
          const { [commentId]: _, ...rest } = optimisticMap;
          return rest;
        });
        toast.dismiss(undoItem.toastId);
        return prev.filter((u) => u.comment.id !== commentId);
      }
      return prev;
    });
  };

  // Handler to reply to a comment (optimistic)
  const handleReply = async (parentId: string, content: string, retryId?: string) => {
    const tempId = retryId || `temp-${uuidv4()}`;
    const optimisticReply = {
      id: tempId,
      content,
      createdAt: new Date().toISOString(),
      parentId,
      author: session?.user ? {
        username: session.user.username,
        id: session.user.id,
        profile: (session.user as any)?.profile || {},
      } : {},
      children: [],
    };
    if (!retryId) setComments((prev: any[]) => addReply(prev, parentId, optimisticReply));
    setOptimisticMap((prev) => ({ ...prev, [tempId]: { saving: true } }));
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev: any[]) => replaceReply(prev, tempId, { ...data.comment, children: [] }));
        setOptimisticMap((prev) => {
          const { [tempId]: _, ...rest } = prev;
          return rest;
        });
      } else {
        setOptimisticMap((prev) => ({ ...prev, [tempId]: { error: data.error || 'Failed to post reply.', retry: () => handleReply(parentId, content, tempId) } }));
      }
    } catch (e) {
      setOptimisticMap((prev) => ({ ...prev, [tempId]: { error: 'Network error. Try again.', retry: () => handleReply(parentId, content, tempId) } }));
    }
  };

  // Helper functions to update nested comments
  function updateCommentContent(comments: any[], commentId: string, content: string): any[] {
    return comments.map((c) =>
      c.id === commentId
        ? { ...c, content }
        : { ...c, children: updateCommentContent(c.children || [], commentId, content) }
    );
  }
  function removeComment(comments: any[], commentId: string): any[] {
    return comments
      .filter((c) => c.id !== commentId)
      .map((c) => ({ ...c, children: removeComment(c.children || [], commentId) }));
  }
  function addReply(comments: any[], parentId: string, reply: any): any[] {
    return comments.map((c) =>
      c.id === parentId
        ? { ...c, children: [...(c.children || []), reply] }
        : { ...c, children: addReply(c.children || [], parentId, reply) }
    );
  }
  function replaceReply(comments: any[], tempId: string, realReply: any): any[] {
    return comments.map((c) =>
      c.id === tempId
        ? realReply
        : { ...c, children: replaceReply(c.children || [], tempId, realReply) }
    );
  }

  // Helper to find a comment by id
  function findComment(comments: any[], commentId: string): any | null {
    for (const c of comments) {
      if (c.id === commentId) return c;
      const found = findComment(c.children || [], commentId);
      if (found) return found;
    }
    return null;
  }
  // Helper to restore a deleted comment at the original position
  function restoreComment(comments: any[], commentId: string, comment: any, parentId: string | null, index: number): any[] {
    if (!comment) return comments;
    if (!parentId) {
      // Top-level comment
      const filtered = comments.filter(c => c.id !== commentId);
      const newComments = [...filtered];
      newComments.splice(index, 0, comment);
      return newComments;
    }
    return comments.map((c) => {
      if (c.id === parentId) {
        const filteredChildren = (c.children || []).filter((child: any) => child.id !== commentId);
        const newChildren = [...filteredChildren];
        newChildren.splice(index, 0, comment);
        return { ...c, children: newChildren };
      }
      return { ...c, children: restoreComment(c.children || [], commentId, comment, parentId, index) };
    });
  }

  return (
    <>
      {/* Skip link for accessibility */}
      <a href="#main-comments" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-blue-700 focus:rounded focus:p-2 focus:shadow-lg">Skip to comments</a>
      <section id="main-comments" role="region" aria-label="Comments" tabIndex={-1}>
        <h2 className="text-xl font-bold text-[#2a4257] mb-4">Comments</h2>
        <div className="mb-4">
          <CommentForm
            key={`new-comment-${session?.user?.id || 'guest'}`}
            onSubmit={handleAddComment}
            submitLabel="Post"
            requireAuth={!session?.user}
            onRequireAuth={() => setShowLoginModal(true)}
            canEdit={!!session?.user}
            contextKey={`new-${postId}-${session?.user?.id || 'guest'}`}
          />
        </div>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
              <div className="mb-4 text-lg font-semibold text-[#2a4257]">You must be logged in to comment.</div>
              <Link href="/login">
                <button className="bg-[#6bb7b7] hover:bg-[#4e9a9a] text-white font-semibold px-4 py-2 rounded shadow">
                  Login
                </button>
              </Link>
              <button
                className="block mt-4 text-gray-500 hover:underline mx-auto"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {comments.length > 0 ? (
          <CommentThread
            comments={comments}
            currentUserId={currentUserId}
            onEdit={(commentId, content) => handleEdit(commentId, content, { oldContent: findComment(comments, commentId)?.content })}
            onDelete={(commentId) => handleDelete(commentId, { comment: findComment(comments, commentId) })}
            onReply={handleReply}
            optimisticMap={optimisticMap}
          />
        ) : (
          <div className="text-gray-500 text-sm">No comments yet.</div>
        )}
        {/* Accessibility: Jump to comment form button at the bottom, right-aligned */}
        <div className="flex justify-end">
          <a
            href="#main-comments"
            className="mt-6 mb-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-blue-100 text-blue-700 font-medium shadow hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition w-auto text-sm group"
            aria-label="Jump to comment form"
            title="Jump to comment form"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="hidden sm:inline group-hover:inline group-focus:inline text-sm">Jump</span>
          </a>
        </div>
      </section>
    </>
  );
} 