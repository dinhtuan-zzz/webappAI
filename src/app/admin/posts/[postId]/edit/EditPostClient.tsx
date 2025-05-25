"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PostForm } from "@/components/PostForm";
import type { SelectOption } from "@/types";
import useSWR from "swr";
import type { PostFormValues } from "@/types/Post";
import type { PostUpdateInput } from "@/types/Post";

const fetcher = async (url: string): Promise<SelectOption[]> => {
  const res = await fetch(url);
  const data = await res.json();
  return (data.categories || []).map((cat: { id: string; name: string; postCount?: number }) => ({ label: cat.name, value: cat.id, count: cat.postCount }));
};

export default function EditPostClient({ postId, initial, categories: initialCategories }: { postId: string, initial: PostFormValues, categories: SelectOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optimistic, setOptimistic] = useState<PostFormValues>(initial); // For optimistic UI
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PostFormValues, string>>>({});

  // SWR for categories
  const { data: categories = initialCategories, mutate } = useSWR<SelectOption[]>("/api/categories", fetcher, { fallbackData: initialCategories });

  const handleSubmit = async (data: PostUpdateInput) => {
    setLoading(true);
    setError("");
    setFieldErrors({});
    setOptimistic({ ...optimistic, ...data }); // Optimistically update UI
    toast.success("Saved! (optimistic)");
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        // Revert optimistic update
        setOptimistic(initial);
        // Show detailed error
        if (result.errors) {
          setFieldErrors(result.errors);
          toast.error("Validation error. Please check the form.");
        } else if (result.error) {
          setError(result.error);
          toast.error(result.error);
        } else {
          setError("Failed to save");
          toast.error("Failed to save");
        }
        return;
      }
      // Confirmed by server
      toast.success("Saved!");
      setOptimistic({ ...optimistic, ...data }); // Confirm optimistic state
    } catch (e) {
      setOptimistic(initial);
      setError(e instanceof Error ? e.message : "Failed to save");
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/posts");
  };

  const handleCreateCategory = async (name: string) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create category");
      toast.success("Category created");
      await mutate(); // Refetch categories after quick-add
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create category");
    }
  };

  // Image upload handler
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    if (!res.ok || !result.url) {
      toast.error(result.error || "Failed to upload image");
      throw new Error(result.error || "Failed to upload image");
    }
    return result.url;
  };

  return (
    <PostForm
      initial={optimistic}
      categories={categories}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onCreateCategory={handleCreateCategory}
      fieldErrors={fieldErrors}
      onImageUpload={handleImageUpload}
    />
  );
} 