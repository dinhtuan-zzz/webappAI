"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThumbsUp, MessageSquare, Eye } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type { Post, Tag } from "@/types/Post";

function formatNumber(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : n.toString();
}

function getTrendingScore(post: any) {
  return (
    (post._count?.votes || 0) +
    (post._count?.comments || 0) +
    (post.viewCount || 0)
  );
}

/**
 * TrendingPosts - Displays a list of trending posts.
 *
 * @param {Object} props
 * @param {any[] | null} [props.posts] - Array of trending post objects.
 * @returns {JSX.Element}
 */
export function TrendingPosts({ posts }: { posts?: any[] | null }) {
  if (!posts || posts.length === 0) {
    // Skeleton: 5 placeholder cards matching real trending post UI
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#2a4257] mb-3">Trending Posts</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`min-w-[220px] max-w-xs flex-shrink-0 rounded-lg border shadow-sm bg-white/90 dark:bg-[#23272f] p-4 flex flex-col gap-2 relative`}
            >
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-1" /> {/* title */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" /> {/* avatar */}
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" /> {/* name */}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              {/* Badges for #1, #2, #3 */}
              {i === 0 && (
                <span className="absolute top-2 right-2 bg-[#6bb7b7] text-white text-xs px-2 py-0.5 rounded font-bold shadow">#1</span>
              )}
              {i === 1 && (
                <span className="absolute top-2 right-2 bg-[#b7d8e6] text-[#2a4257] text-xs px-2 py-0.5 rounded font-bold shadow">#2</span>
              )}
              {i === 2 && (
                <span className="absolute top-2 right-2 bg-[#e6f0f7] text-[#2a4257] text-xs px-2 py-0.5 rounded font-bold shadow">#3</span>
              )}
            </div>
          ))}
        </div>
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    );
  }

  // Sort by trending score, take top 5
  const trending = [...posts]
    .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
    .slice(0, 5);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#2a4257] mb-3">Trending Posts</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        {trending.map((post, i) => (
          <Link
            key={post.id}
            href={`/post/${post.slug}`}
            className={`min-w-[220px] max-w-xs flex-shrink-0 rounded-lg border shadow-sm bg-white/90 dark:bg-[#23272f] p-4 flex flex-col gap-2 hover:shadow-md transition-shadow relative ${
              i === 0
                ? "ring-2 ring-[#6bb7b7] scale-105 z-10"
                : i < 3
                ? "ring-1 ring-[#6bb7b7]/40"
                : ""
            }`}
          >
            <div className="font-semibold text-[#2a4257] line-clamp-2 mb-1">{post.title}</div>
            <div className="flex items-center gap-2 mb-1">
              {/* <Image
                src={post.author?.profile?.avatarUrl || getGravatarUrl(post.author?.email || "unknown@example.com", 20, "identicon")}
                alt={post.author?.profile?.displayName || post.author?.username || "User"}
                width={20}
                height={20}
                className="rounded-full border"
              /> */}
              <Avatar
                avatarUrl={post.author?.profile?.avatarUrl}
                email={post.author?.email}
                name={post.author?.profile?.displayName || post.author?.username || "User"}
                size={20}
              />
              <span className="text-xs text-[#2a4257] font-medium">
                {post.author?.profile?.displayName || post.author?.username || "User"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{formatNumber(post._count?.votes || 0)}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{formatNumber(post._count?.comments || 0)}</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(post.viewCount || 0)}</span>
            </div>
            {i === 0 && (
              <span className="absolute top-2 right-2 bg-[#6bb7b7] text-white text-xs px-2 py-0.5 rounded font-bold shadow">#1</span>
            )}
            {i === 1 && (
              <span className="absolute top-2 right-2 bg-[#b7d8e6] text-[#2a4257] text-xs px-2 py-0.5 rounded font-bold shadow">#2</span>
            )}
            {i === 2 && (
              <span className="absolute top-2 right-2 bg-[#e6f0f7] text-[#2a4257] text-xs px-2 py-0.5 rounded font-bold shadow">#3</span>
            )}
          </Link>
        ))}
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
} 