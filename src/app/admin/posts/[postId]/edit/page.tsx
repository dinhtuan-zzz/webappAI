import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CategoryOption } from "@/components/ui/MultiCategorySelect";
import EditPostClient from "./EditPostClient";
import type { Category } from "@/types/Category";

export default async function EditPostPage({ params }: { params: { postId: string } }) {
  // Enforce admin-only access
  const session = await requireAdmin();
  if (!session) redirect("/login");

  // Fetch post and categories
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id: params.postId },
      include: {
        categories: { include: { category: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!post) notFound();

  // Map categories for MultiCategorySelect
  const allCategoryOptions: CategoryOption[] = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
  }));
  const postCategories: CategoryOption[] = (post.categories || []).map((c: { category: Category }) => ({
    id: c.category.id,
    name: c.category.name,
    archived: !categories.some((cat: { id: string }) => cat.id === c.category.id),
  }));

  // Initial form values
  const initial = {
    title: post.title,
    content: post.content,
    categories: postCategories,
    status: post.status,
  };

  return (
    <EditPostClient
      postId={params.postId}
      initial={initial}
      categories={allCategoryOptions}
    />
  );
} 