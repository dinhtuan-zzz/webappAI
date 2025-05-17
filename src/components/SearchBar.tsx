"use client";
import { ChangeEvent } from "react";

export function SearchBar({ value, onChange, placeholder }: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="w-full max-w-xl mx-auto mb-8 flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Search..."}
        className="w-full px-4 py-2 rounded-lg border border-[#e6e6e6] focus:outline-none focus:ring-2 focus:ring-[#6bb7b7] bg-white dark:bg-[#23272f] text-[#2a4257] text-base shadow"
      />
    </div>
  );
} 