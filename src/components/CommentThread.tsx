"use client";
import { CommentItem } from "@/components/CommentItem";
import type { Comment } from "@/types/Comment";

export function CommentThread({
  comments,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
}: {
  comments: Comment[];
  currentUserId?: string;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col">
      {comments.map((comment) => (
        <div key={comment.id} id={comment.id} className="">
          <CommentItem
            comment={comment}
            currentUserId={currentUserId}
            onEdit={(content) => onEdit(comment.id, content)}
            onDelete={() => onDelete(comment.id)}
            onReply={(content) => onReply(comment.id, content)}
          />
          {comment.children && comment.children.length > 0 && (
            <div className="ml-6 border-l-2 border-[#e6e6e6] pl-4">
              <CommentThread
                comments={comment.children}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}