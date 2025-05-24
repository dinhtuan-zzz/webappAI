"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DateFilter from "@/components/DateFilter";
import { Eye, Edit, Trash2 } from "lucide-react";
import clsx from "clsx";
import useSWR from "swr";
import { MultiSelectNav, MultiSelectOptionBase } from "@/components/MultiSelectNav";
import Link from "next/link";
import Image from "next/image";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  postCount: number;
};

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

type CategoryOption = MultiSelectOptionBase;
type StatusOption = MultiSelectOptionBase;

export default function AdminPostsClient() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useSWR("/api/categories", (url) => fetch(url).then(res => res.json()));
  const allCategories: Category[] = categoriesData?.categories || [];
  const [deleting, setDeleting] = useState(false);
  const deleteButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const cancelRef = useRef<HTMLButtonElement>(null);
  const undoButtonRef = useRef<HTMLButtonElement>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  const categoryOptions = useMemo(() =>
    allCategories.map(cat => ({
      label: cat.name,
      value: cat.id,
      count: cat.postCount,
    })),
    [allCategories]
  );

  const statusOptions = useMemo(() => STATUS_OPTIONS, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (search) params.set("search", search);
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
  }, [page, search, date, selectedCategories, selectedStatuses]);

  useEffect(() => { setDeleteId(null); }, []);

  // Focus management: auto-focus Cancel when dialog opens
  useEffect(() => {
    if (!!deleteId && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [deleteId]);

  // Focus management: return focus to delete icon after dialog closes
  useEffect(() => {
    if (!deleteId && document.activeElement && document.activeElement instanceof HTMLElement) {
      // Find the last focused delete button
      const lastDeleteBtn = Object.values(deleteButtonRefs.current).find(btn => btn && btn === document.activeElement);
      if (!lastDeleteBtn && deleteButtonRefs.current.lastFocused) {
        deleteButtonRefs.current.lastFocused.focus();
      }
    }
  }, [deleteId]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (categoriesLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafb] p-4 md:p-8">
        <div className="max-w-xl mx-auto">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-96 w-full mb-4" />
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
      <div className="overflow-x-auto rounded-xl shadow-sm bg-white/90 border border-[#e6e6e6]">
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
              posts.map((post, idx) => (
                <tr
                  key={post.id}
                  className="border-b last:border-b-0 hover:bg-[#f5faff] transition-colors"
                >
                  <td className="p-3 align-middle">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="p-3 align-middle max-w-xs">
                    <span className="font-semibold line-clamp-2">{post.title}</span>
                    <div className="text-xs text-gray-400 line-clamp-1">{post.slug}</div>
                  </td>
                  <td className="p-3 align-middle flex items-center gap-2">
                    {post.author?.profile?.avatarUrl && (
                      <Image
                        src={post.author.profile.avatarUrl}
                        alt={post.author.profile.displayName || post.author.username || "Tác giả"}
                        className="w-7 h-7 rounded-full border border-gray-200 object-cover bg-white"
                        width={28}
                        height={28}
                        loading="lazy"
                      />
                    )}
                    <span className="font-medium">{post.author?.profile?.displayName || post.author?.username || "-"}</span>
                  </td>
                  <td className="p-3 align-middle whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 align-middle">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="p-3 align-middle text-center">{post.viewCount ?? 0}</td>
                  <td className="p-3 align-middle flex gap-2">
                    <Link href={`/admin/posts/${post.id}`} aria-label="Xem chi tiết bài viết">
                      <Tooltip content="Xem chi tiết bài viết">
                        <Button size="icon" variant="ghost" aria-label="Xem chi tiết bài viết">
                          <Eye className="w-5 h-5 text-sky-500" />
                        </Button>
                      </Tooltip>
                    </Link>
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Tooltip content="Sửa bài viết">
                        <Button size="icon" variant="ghost" aria-label="Sửa bài viết">
                          <Edit className="w-5 h-5 text-green-500" />
                        </Button>
                      </Tooltip>
                    </Link>
                    <Tooltip content="Xóa bài viết">
                      <Button
                        ref={el => { deleteButtonRefs.current[post.id] = el; }}
                        size="icon"
                        variant="ghost"
                        aria-label="Xóa bài viết"
                        onClick={() => {
                          deleteButtonRefs.current.lastFocused = deleteButtonRefs.current[post.id];
                          setDeleteId(post.id);
                        }}
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </Button>
                    </Tooltip>
                  </td>
                </tr>
              ))
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="w-full max-w-sm">
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.</DialogDescription>
          <div className="flex gap-2 justify-center mt-4">
            <Button ref={cancelRef} variant="outline" onClick={() => setDeleteId(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={async () => {
              if (!deleteId) return;
              setDeleting(true);
              const postToDelete = posts.find(p => p.id === deleteId);
              const previousStatus = postToDelete?.status || "PUBLISHED";
              try {
                const res = await fetch(`/api/admin/posts/${deleteId}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to delete post");
                setPosts(posts => posts.filter(p => p.id !== deleteId));
                setDeleteId(null);
                // Show undo toast and auto-focus Undo button
                toast.success(
                  <span>
                    Đã xóa bài viết thành công
                    <Button
                      ref={undoButtonRef}
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const undoRes = await fetch(`/api/admin/posts/${deleteId}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ previousStatus }),
                          });
                          if (!undoRes.ok) throw new Error("Failed to undo delete");
                          setPage(1); // refresh posts list
                          toast.success("Đã hoàn tác xóa bài viết");
                        } catch {
                          toast.error("Hoàn tác thất bại");
                        }
                      }}
                    >
                      Hoàn tác
                    </Button>
                  </span>
                );
                // Auto-focus Undo button in toast
                setTimeout(() => {
                  if (undoButtonRef.current) undoButtonRef.current.focus();
                }, 100);
              } catch (e) {
                toast.error("Xóa bài viết thất bại");
              } finally {
                setDeleting(false);
              }
            }} disabled={deleting}>
              {deleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <style jsx global>{`
        .font-manga-heading {
          font-family: 'M PLUS Rounded 1c', 'Segoe UI', 'Arial', sans-serif;
          letter-spacing: 0.01em;
        }
      `}</style>
    </div>
  );
} 