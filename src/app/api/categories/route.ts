import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";
import type { Category } from "@/types/Category";

const categoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
});

/**
 * GET /api/categories
 *
 * Fetches all categories, including their id, name, and post count.
 *
 * @returns {Response} JSON response with an array of categories.
 *
 * Each category includes:
 * - id: string
 * - name: string
 * - postCount: number
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        posts: true,
      },
      orderBy: { name: "asc" },
    });
    const result: Category[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      postCount: cat.posts.length,
    }));
    return NextResponse.json({ categories: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { name } = parsed.data;
  // Check for duplicate
  const exists = await prisma.category.findFirst({ where: { name: name.trim() } });
  if (exists) {
    return NextResponse.json({ error: "Category already exists" }, { status: 400 });
  }
  const category = await prisma.category.create({
    data: { name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, "-") },
  });
  const result: Category = { id: category.id, name: category.name };
  return NextResponse.json({ category: result });
} 