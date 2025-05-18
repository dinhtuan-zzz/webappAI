"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-6 gap-4">
        <div className="flex gap-4">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
        <div className="text-gray-500 text-sm">
          © 2025 Lavie. All rights reserved.
        </div>
        {/* Social icons (optional) */}
        {/* <div className="flex gap-2">...</div> */}
      </div>
    </footer>
  );
} 