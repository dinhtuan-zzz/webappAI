import { ThumbsUp, ThumbsDown } from "lucide-react";

/**
 * VoteDisplay - Displays the vote count for a post or comment.
 *
 * @param {Object} props
 * @param {number} props.count - The vote count to display.
 * @returns {JSX.Element}
 */
export function VoteDisplay({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 text-[#2a4257]">
      <ThumbsUp className="w-5 h-5 text-[#6bb7b7]" />
      <span className="font-semibold text-base">{count}</span>
    </div>
  );
} 