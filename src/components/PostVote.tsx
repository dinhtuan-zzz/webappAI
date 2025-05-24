"use client";
import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * PostVote - Handles voting logic and UI for a post.
 *
 * @param {Object} props
 * @param {string} props.postId - The ID of the post to vote on.
 * @param {number} props.initialCount - The initial vote count.
 * @param {number | null} props.initialUserVote - The current user's vote (1, -1, or null).
 * @returns {JSX.Element}
 */
export function PostVote({ postId, initialCount, initialUserVote }: {
  postId: string;
  initialCount: number;
  initialUserVote: 1 | -1 | 0;
}) {
  const { data: session } = useSession();
  const [count, setCount] = useState(initialCount);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(initialUserVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (!session) return;
    setLoading(true);
    try {
      // If user has already voted, any click removes the vote (neutral)
      const sendValue = userVote !== 0 ? userVote : value;
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: sendValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setCount(data.count);
        setUserVote(data.userVote);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === 1 ? "default" : "outline"}
        size="icon"
        disabled={!session || loading}
        aria-label="Upvote"
        onClick={() => handleVote(1)}
        className={userVote === 1 ? "bg-[#6bb7b7] text-white" : ""}
      >
        <ThumbsUp className="w-5 h-5" />
      </Button>
      <span className="font-semibold text-base min-w-[2ch] text-center">{count}</span>
      <Button
        variant={userVote === -1 ? "default" : "outline"}
        size="icon"
        disabled={!session || loading}
        aria-label="Downvote"
        onClick={() => handleVote(-1)}
        className={userVote === -1 ? "bg-[#e57373] text-white" : ""}
      >
        <ThumbsDown className="w-5 h-5" />
      </Button>
    </div>
  );
} 