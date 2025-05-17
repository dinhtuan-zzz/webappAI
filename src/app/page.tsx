"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { UserMenu } from "@/components/UserMenu";

export default function HomePageWrapper() {
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts on mount
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts);
      setLoading(false);
    })();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter((post) =>
      post.title.toLowerCase().includes(q) ||
      (post.summary && post.summary.toLowerCase().includes(q)) ||
      (post.tags && post.tags.some((t: any) => t.tag.name.toLowerCase().includes(q)))
    );
  }, [search, posts]);

  return <Home posts={filteredPosts} search={search} setSearch={setSearch} loading={loading} />;
}

function Home({ posts, search, setSearch, loading }: { posts: any[]; search: string; setSearch: (v: string) => void; loading: boolean }) {
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

      {/* Search Bar */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-6 py-8">
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

function PostCard({ post }: { post: any }) {
  const avatar = post.author?.profile?.avatarUrl || "/avatar-placeholder.png";
  const authorName = post.author?.profile?.displayName || post.author?.username || "Unknown";
  const thumbnail = post.thumbnail || "/blog-thumb-placeholder.jpg";
  return (
    <Link href={`/${post.slug}`} className="block group">
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
            <Image
              src={avatar}
              alt={authorName}
              width={28}
              height={28}
              className="rounded-full border border-[#e6e6e6]"
            />
            <span className="text-xs text-[#2a4257] font-medium">{authorName}</span>
            <span className="text-xs text-gray-400 ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{post._count.votes}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{post._count.comments}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
