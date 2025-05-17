import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Check if user/email exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email or username already in use" }, { status: 409 });
    }
    // Hash password
    const hashed = await hash(password, 10);
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 