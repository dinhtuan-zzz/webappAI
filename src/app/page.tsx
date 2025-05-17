"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Eye } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { UserMenu } from "@/components/UserMenu";
import { CategoriesNav, Category } from "@/components/CategoriesNav";
import useSWR from "swr";
import { TrendingPosts } from "@/components/TrendingPosts";
import { Avatar } from "@/components/Avatar";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function HomePageWrapper() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data: postsData, isLoading } = useSWR("/api/posts", fetcher);
  const posts = postsData?.posts || [];
  const { data: trendingData } = useSWR("/api/posts/trending", fetcher);
  const trendingPosts = trendingData?.posts || [];
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
      filtered = filtered.filter((post) =>
        post.categories && post.categories.some((cat: any) => selectedCategories.includes(cat.category.id))
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(q) ||
        (post.summary && post.summary.toLowerCase().includes(q)) ||
        (post.tags && post.tags.some((t: any) => t.tag.name.toLowerCase().includes(q)))
      );
    }
    return filtered;
  }, [search, posts, selectedCategories]);

  return <Home
    posts={filteredPosts}
    search={search}
    setSearch={setSearch}
    loading={isLoading || loadingCats}
    categories={categories}
    selectedCategories={selectedCategories}
    setSelectedCategories={setSelectedCategories}
    trendingPosts={trendingPosts}
  />;
}

function Home({ posts, search, setSearch, loading, categories, selectedCategories, setSelectedCategories, trendingPosts }: {
  posts: any[];
  search: string;
  setSearch: (v: string) => void;
  loading: boolean;
  categories: Category[];
  selectedCategories: string[];
  setSelectedCategories: (ids: string[]) => void;
  trendingPosts: any[];
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f7fafc] via-[#e6f0f7] to-[#f3f7f4] text-gray-900 dark:text-gray-100 font-sans">
      {/* Header */}
      <header className="w-full px-4 py-4 flex items-center justify-between bg-white/80 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Image src="/frieren-hero-placeholder.png" alt="Lavie Logo" width={40} height={40} className="rounded" />
          <span className="text-xl font-bold text-[#2a4257] tracking-tight">Lavie Manga Blog</span>
        </div>
        <nav className="flex gap-4 items-center text-sm font-medium text-[#2a4257]">
          <a href="#" className="hover:text-[#6bb7b7] transition-colors">Home</a>
          <a href="#" className="hover:text-[#6bb7b7] transition-colors">Explore</a>
          <a href="#" className="hover:text-[#6bb7b7] transition-colors">About</a>
          {/* <Link href="/api/auth/signin" >
            <Button className="ml-4 bg-[#6bb7b7] hover:bg-[#4e9a9a] text-white font-semibold shadow-md" size="sm">
              Login
            </Button>
          </Link> */}
          <UserMenu />
        </nav>
      </header>

      {/* Categories Navigation */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-6 py-8">
        <TrendingPosts posts={trendingPosts} />
        <CategoriesNav
          categories={categories}
          selected={selectedCategories}
          onSelect={setSelectedCategories}
        />
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search blogs by title, summary, or tag..." />
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2a4257] mb-8 text-center tracking-tight">
          Latest Blogs
        </h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
        <div className="flex justify-center mt-10">
          <Button size="lg" className="bg-[#6bb7b7] hover:bg-[#4e9a9a] text-white font-semibold shadow-md">
            Load More
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Lavie Manga Blog. Inspired by Frieren. All rights reserved.
      </footer>
    </div>
  );
}

function formatNumber(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : n.toString();
}

function PostCard({ post }: { post: any }) {
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
            <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{post._count.votes}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{post._count.comments}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(post.viewCount || 0)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
