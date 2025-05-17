"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CommentForm } from "@/components/CommentForm";
import { CommentThread } from "@/components/CommentThread";
import Link from "next/link";

export function CommentsSection({ postId, initialComments, currentUserId }: {
  postId: string;
  initialComments: any[];
  currentUserId?: string;
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handler to add a new top-level comment
  const handleAddComment = async (content: string) => {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (res.ok) {
      setComments((prev: any[]) => [...prev, { ...data.comment, children: [] }]);
    }
  };

  // Handler to edit a comment
  const handleEdit = async (commentId: string, content: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setComments((prev: any[]) => updateCommentContent(prev, commentId, content));
    }
  };

  // Handler to delete a comment
  const handleDelete = async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev: any[]) => removeComment(prev, commentId));
    }
  };

  // Handler to reply to a comment
  const handleReply = async (parentId: string, content: string) => {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });
    const data = await res.json();
    if (res.ok) {
      setComments((prev: any[]) => addReply(prev, parentId, { ...data.comment, children: [] }));
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

  return (
    <section>
      <h2 className="text-xl font-bold text-[#2a4257] mb-4">Comments</h2>
      <div className="mb-4">
        <CommentForm
          onSubmit={handleAddComment}
          submitLabel="Post"
          requireAuth={!session?.user}
          onRequireAuth={() => setShowLoginModal(true)}
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReply={handleReply}
        />
      ) : (
        <div className="text-gray-500 text-sm">No comments yet.</div>
      )}
    </section>
  );
} 