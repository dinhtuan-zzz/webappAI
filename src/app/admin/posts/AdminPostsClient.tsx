"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DateFilter from "@/components/DateFilter";
import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
import clsx from "clsx";
import useSWR from "swr";
import { MultiSelectNav } from "@/components/MultiSelectNav";
import Link from "next/link";
import Image from "next/image";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { PostResponse as Post, Category, SelectOption } from "@/types";
import PostDeleteDialog from "@/components/PostDeleteDialog";
import AdminPostRow from "./AdminPostRow";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-200 text-gray-700",
  PUBLISHED: "bg-teal-100 text-teal-700 border-teal-300",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
  TRASH: "bg-gray-100 text-gray-400 border-gray-200",
  DELETED: "bg-gray-100 text-gray-400 border-gray-200",
};

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã đăng", value: "PUBLISHED" },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Thùng rác", value: "TRASH" },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full border text-xs font-semibold transition-colors",
        STATUS_COLORS[status] || "bg-gray-100 text-gray-500 border-gray-200"
      )}
      aria-label={status}
    >
      {status}
    </span>
  );
}

type CategoryOption = SelectOption;
type StatusOption = SelectOption;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminPostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useSWR("/api/categories", (url) => fetch(url).then(res => res.json()));
  const allCategories: Category[] = categoriesData?.categories || [];

  const categoryOptions = useMemo(() =>
    allCategories.map(cat => ({
      label: cat.name,
      value: cat.id,
      count: cat.postCount,
    })),
    [allCategories]
  );

  const statusOptions = useMemo(() => STATUS_OPTIONS, []);

  const debouncedSearch = useDebounce(search, 300);

  const fetchPosts = () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (date && date !== "all") params.set("date", date);
    if (selectedCategories.length > 0) {
      params.set("categoryIds", selectedCategories.join(","));
    }
    if (selectedStatuses.length > 0) {
      selectedStatuses.forEach(status => params.append("status", status));
    }
    fetch(`/api/admin/posts?${params.toString()}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      })
      .catch(() => setError("Không thể tải danh sách bài viết."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, date, selectedCategories, selectedStatuses]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if ((categoriesLoading || loading) && posts.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafb] p-4 md:p-8">
        <div className="max-w-xl mx-auto">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-96 w-full mb-4" />
          <div className="overflow-x-auto rounded-xl shadow-sm bg-white/90 border border-[#e6e6e6]">
            <table className="min-w-full text-sm text-[#2a4257]">
              <thead>
                <tr>
                  <th className="p-3 text-left font-semibold">#</th>
                  <th className="p-3 text-left font-semibold">Tiêu đề</th>
                  <th className="p-3 text-left font-semibold">Tác giả</th>
                  <th className="p-3 text-left font-semibold">Ngày tạo</th>
                  <th className="p-3 text-left font-semibold">Trạng thái</th>
                  <th className="p-3 text-left font-semibold">Lượt xem</th>
                  <th className="p-3 text-left font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafb] p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-[#2a4257] tracking-tight font-manga-heading">
        Quản lý Bài viết
      </h1>
      <div className="flex flex-col gap-4 mb-4">
        <SearchBar
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề, tác giả..."
        />
        <MultiSelectNav<CategoryOption>
          label="Chuyên mục:"
          options={categoryOptions}
          selected={selectedCategories}
          onSelect={setSelectedCategories}
          loading={categoriesLoading}
          error={categoriesError ? "Không thể tải chuyên mục." : ""}
          allLabel="Tất cả"
        />
        <MultiSelectNav<StatusOption>
          label="Trạng thái:"
          options={statusOptions}
          selected={selectedStatuses}
          onSelect={setSelectedStatuses}
          allLabel="Tất cả"
        />
        <div>
          <div className="mb-1 font-medium text-sm text-[#2a4257]">Ngày:</div>
          <DateFilter value={date} onChange={setDate} />
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-sm bg-white/90 border border-[#e6e6e6] relative">
        {loading && posts.length > 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <Loader2 className="animate-spin w-8 h-8 text-sky-500" />
          </div>
        )}
        <table className="min-w-full text-sm text-[#2a4257]">
          <thead className="bg-[#f3f7fa]">
            <tr>
              <th className="p-3 text-left font-semibold">#</th>
              <th className="p-3 text-left font-semibold">Tiêu đề</th>
              <th className="p-3 text-left font-semibold">Tác giả</th>
              <th className="p-3 text-left font-semibold">Ngày tạo</th>
              <th className="p-3 text-left font-semibold">Trạng thái</th>
              <th className="p-3 text-left font-semibold">Lượt xem</th>
              <th className="p-3 text-left font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center animate-pulse text-gray-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">{error}</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">Không có bài viết nào.</td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {posts.map((post, idx) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                    className="border-b last:border-b-0 hover:bg-[#f5faff] transition-colors"
                  >
                    <AdminPostRow
                      post={post}
                      idx={idx}
                      page={page}
                      onDeleted={() => setPosts(posts => posts.filter(p => p.id !== post.id))}
                      onUndo={fetchPosts}
                    />
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            &larr;
          </Button>
          <span className="text-sm font-medium">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            &rarr;
          </Button>
        </div>
      )}
      <style jsx global>{`
        .font-manga-heading {
          font-family: 'M PLUS Rounded 1c', 'Segoe UI', 'Arial', sans-serif;
          letter-spacing: 0.01em;
        }
      `}</style>
    </div>
  );
} 