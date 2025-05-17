"use client";
import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";

function formatNumber(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : n.toString();
}

export function ViewCount({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (hasIncremented.current) return;
    hasIncremented.current = true;
    (async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/view`, { method: "POST" });
        const data = await res.json();
        if (res.ok && typeof data.viewCount === "number") {
          setCount(data.viewCount);
        }
      } catch {}
    })();
    // Only increment once per mount
    // eslint-disable-next-line
  }, [postId]);

  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <Eye className="w-4 h-4" />
      {formatNumber(count)}
    </span>
  );
} 