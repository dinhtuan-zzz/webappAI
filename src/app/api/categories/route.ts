import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      postCount: cat.posts.length,
    }));
    return NextResponse.json({ categories: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
} 