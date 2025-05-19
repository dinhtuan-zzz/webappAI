"use client";
import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header({ userMenu }: { userMenu: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };
  return (
    <header className="sticky top-0 z-50 bg-white shadow border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-[#6bb7b7]">Lavie</Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 ml-8">
          <Link href="/">Home</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/trending">Trending</Link>
          <Link href="/about">About</Link>
        </nav>
        {/* Search Bar (optional) */}
        <div className="hidden md:block flex-1 mx-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search..."
          />
        </div>
        {/* User menu */}
        <div className="flex items-center gap-2">
          {userMenu}
          {/* Hamburger for mobile */}
          <button
            className="md:hidden ml-2 p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileNavOpen(v => !v)}
            aria-label="Open navigation menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileNavOpen && (
        <nav className="md:hidden bg-white border-t px-4 pb-4 flex flex-col gap-2">
          <Link href="/" onClick={() => setMobileNavOpen(false)}>Home</Link>
          <Link href="/categories" onClick={() => setMobileNavOpen(false)}>Categories</Link>
          <Link href="/trending" onClick={() => setMobileNavOpen(false)}>Trending</Link>
          <Link href="/about" onClick={() => setMobileNavOpen(false)}>About</Link>
          <div className="mt-2">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
            />
          </div>
        </nav>
      )}
    </header>
  );
} 