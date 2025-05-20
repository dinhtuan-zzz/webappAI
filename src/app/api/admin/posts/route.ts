import { requireAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // TODO: Implement posts admin logic
  return NextResponse.json({ message: "Admin access granted. Posts manager endpoint." });
} 