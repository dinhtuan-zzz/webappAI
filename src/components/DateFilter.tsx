import React from "react";

const OPTIONS = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "This year", value: "year" },
];

export default function DateFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 items-center">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            value === opt.value
              ? "bg-[#6bb7b7] text-white border-[#6bb7b7]"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
} 