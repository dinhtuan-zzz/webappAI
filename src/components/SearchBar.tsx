"use client";
import { ChangeEvent, KeyboardEvent } from "react";

export function SearchBar({ value, onChange, placeholder, onKeyDown }: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative w-full max-w-[8rem] md:max-w-[12rem]">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Search..."}
        className="w-full h-9 pl-9 pr-3 py-1 rounded border border-[#e6e6e6] focus:outline-none focus:ring-2 focus:ring-[#6bb7b7] bg-white dark:bg-[#23272f] text-[#2a4257] text-sm transition"
        onKeyDown={onKeyDown}
      />
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6bb7b7] pointer-events-none">
        <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="7" />
          <line x1="15" y1="15" x2="11.5" y2="11.5" />
        </svg>
      </span>
    </div>
  );
} 