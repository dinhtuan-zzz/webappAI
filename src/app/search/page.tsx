"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";
import useSWR from "swr";
import { SearchBar } from "@/components/SearchBar";
import { MultiSelectNav, MultiSelectOptionBase } from "@/components/MultiSelectNav";
import DateFilter from "@/components/DateFilter";
import { Avatar } from "@/components/Avatar";
import { ThumbsUp, MessageSquare, Eye } from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { motion, AnimatePresence } from "framer-motion";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const debouncedQuery = useDebounce(query, 300);
  const [categories, setCategories] = useState<string[]>(searchParams?.getAll("categories") || []);
  const [date, setDate] = useState(searchParams?.get("date") || "all");

  // SWR for categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useSWR("/api/categories", fetcher);
  const allCategories: any[] = categoriesData?.categories || [];

  // Build search params for results
  const searchUrl = (() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.append("q", debouncedQuery);
    categories.forEach(cat => params.append("categories", cat));
    if (date && date !== "all") params.append("date", date);
    return `/api/search?${params.toString()}`;
  })();

  // SWR for search results
  const { data: results = [], isLoading: resultsLoading, error: resultsError } = useSWR(searchUrl, fetcher);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-6">
        <SearchBar
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="Search posts..."
        />
        <div>
          <div className="mb-1 font-medium text-sm text-[#2a4257]">Categories:</div>
          {categoriesLoading ? (
            <div className="text-gray-400 text-sm">Loading categories...</div>
          ) : categoriesError ? (
            <div className="text-red-500 text-sm">Failed to load categories.</div>
          ) : (
            <MultiSelectNav<MultiSelectOptionBase>
              label="Chuyên mục:"
              options={allCategories.map((cat: any) => ({
                label: cat.name,
                value: cat.id,
                count: cat.postCount,
              }))}
              selected={categories}
              onSelect={setCategories}
            />
          )}
        </div>
        <div>
          <div className="mb-1 font-medium text-sm text-[#2a4257]">Date:</div>
          <DateFilter value={date} onChange={setDate} />
        </div>
      </div>
      <div className="relative min-h-[200px]">
        {resultsLoading && results.length === 0 ? (
          <div className="flex flex-col gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border rounded shadow-sm bg-white flex flex-col gap-2 animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-full bg-gray-200 w-8 h-8" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded ml-2" />
                </div>
                <div className="h-5 w-1/2 bg-gray-200 rounded mb-1" />
                <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                <div className="flex items-center gap-4 mt-2">
                  <div className="h-3 w-10 bg-gray-100 rounded" />
                  <div className="h-3 w-10 bg-gray-100 rounded" />
                  <div className="h-3 w-10 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : resultsError ? (
          <div className="text-center py-8 text-red-500">Failed to load results.</div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No results found.</div>
        ) : (
          <div className="flex flex-col gap-4 relative">
            {resultsLoading && results.length > 0 && <LoadingOverlay />}
            <AnimatePresence initial={false}>
              {results.map((post: any) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="p-4 border rounded shadow-sm bg-white"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      avatarUrl={post.author?.profile?.avatarUrl}
                      email={post.author?.email}
                      name={post.author?.profile?.displayName || post.author?.username || "User"}
                      size={32}
                    />
                    <span className="text-sm text-[#2a4257] font-medium">
                      {post.author?.profile?.displayName || post.author?.username || "User"}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                  <div className="font-semibold text-lg mb-1">{post.title}</div>
                  <div className="text-gray-700 line-clamp-3 mb-2">{post.excerpt || post.content?.slice(0, 120) + "..."}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{post.votes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{post.comments}</span>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.viewCount}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
} 