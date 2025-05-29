"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { TrendingPosts } from "@/components/TrendingPosts";
import { Avatar } from "@/components/Avatar";
import { MultiSelectNav, MultiSelectOptionBase } from "@/components/MultiSelectNav";
import type { Post } from "@/types/Post";
import type { Category } from "@/types/Category";
import type { Tag } from "@/types/Post";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Home({ session }: { session: unknown }) {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data: postsData, isLoading } = useSWR("/api/posts", fetcher);
  const posts: Post[] = postsData?.posts || [];
  const { data: trendingData } = useSWR("/api/posts/trending", fetcher);
  const trendingPosts: Post[] = trendingData?.posts || [];
  const [loadingCats, setLoadingCats] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    (async () => {
      const catsRes = await fetch("/api/categories");
      const catsData = await catsRes.json();
      setCategories(catsData.categories);
      setLoadingCats(false);
    })();
  }, []);

  // Filter posts by search and selected categories
  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((post: Post) =>
        Array.isArray(post.categories) &&
        post.categories.some((cat: Category) =>
          cat?.id && selectedCategories.includes(cat.id)
        )
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((post: Post) =>
        post.title.toLowerCase().includes(q) ||
        (post.summary && post.summary.toLowerCase().includes(q)) ||
        (post.tags && post.tags.some((t: Tag) => t.name.toLowerCase().includes(q)))
      );
    }
    return filtered;
  }, [search, posts, selectedCategories]);

  const categoryOptions: MultiSelectOptionBase[] = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
    count: cat.postCount,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f7fafc] via-[#e6f0f7] to-[#f3f7f4] text-gray-900 dark:text-gray-100 font-sans">
      {/* Remove Header */}
      {/* Categories Navigation, Trending, Search, Main Content */}
      <TrendingPosts posts={trendingPosts} />
      <MultiSelectNav<MultiSelectOptionBase>
        label="Chuyên mục:"
        options={categoryOptions}
        selected={selectedCategories}
        onSelect={setSelectedCategories}
      />
      <h1 className="text-3xl sm:text-4xl font-bold text-[#2a4257] mb-8 text-center tracking-tight">
        Latest Blogs
      </h1>
      {(isLoading || loadingCats) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/90 dark:bg-[#23272f] rounded-xl shadow-md border border-[#e6e6e6] flex flex-col overflow-hidden">
              <div className="relative h-40 w-full overflow-hidden bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 flex flex-col p-4 gap-2">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-1" /> {/* title */}
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" /> {/* summary */}
                <div className="flex items-center gap-2 mt-auto">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" /> {/* avatar */}
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" /> {/* name */}
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /> {/* date */}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <div className="flex justify-center mt-10">
        <Button size="lg" className="bg-[#6bb7b7] hover:bg-[#4e9a9a] text-white font-semibold shadow-md">
          Load More
        </Button>
      </div>
      {/* Remove Footer */}
    </div>
  );
}

function formatNumber(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : n.toString();
}

/**
 * Card for displaying a single blog post.
 */
function PostCard({ post }: { post: Post }) {
  const author = post.author || {};
  const avatarUrl = author.profile?.avatarUrl;
  const email = author.email;
  const name = author.profile?.displayName || author.username || "Unknown";
  const thumbnail = post.thumbnail || "/blog-thumb-placeholder.jpg";
  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <div className="bg-white/90 dark:bg-[#23272f] rounded-xl shadow-md border border-[#e6e6e6] flex flex-col overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={thumbnail}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="flex-1 flex flex-col p-4 gap-2">
          <h2 className="text-lg font-bold text-[#2a4257] line-clamp-2 group-hover:text-[#6bb7b7] transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{post.summary || post.content?.slice(0, 100) + "..."}</p>
          <div className="flex items-center gap-2 mt-auto">
            <Avatar avatarUrl={avatarUrl} email={email} name={name} size={28} />
            <span className="text-xs text-[#2a4257] font-medium">{name}</span>
            <span className="text-xs text-gray-400 ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{post._count?.votes ?? 0}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{post._count?.comments ?? 0}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(post.viewCount || 0)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 