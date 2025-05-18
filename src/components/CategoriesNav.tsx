"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export type Category = {
  id: string;
  name: string;
  postCount: number;
};

export function CategoriesNav({
  categories= [],
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: string[];
  onSelect: (ids: string[]) => void;
}) {
  // Handle click for a category
  const handleCategoryClick = (id: string) => {
    if (selected.includes(id)) {
      // Deselect if already selected
      onSelect(selected.filter((catId) => catId !== id));
    } else {
      // Multi-select
      onSelect([...selected, id]);
    }
  };
  // Handle 'All' click
  const handleAllClick = () => onSelect([]);

  return (
    <div className="w-full overflow-x-auto mb-6">
      <div className="flex gap-2 whitespace-nowrap">
        <Button
          variant={selected.length === 0 ? "default" : "outline"}
          size="sm"
          className={selected.length === 0 ? "bg-[#6bb7b7] text-white" : ""}
          onClick={handleAllClick}
        >
          #all
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selected.includes(cat.id) ? "default" : "outline"}
            size="sm"
            className={selected.includes(cat.id) ? "bg-[#6bb7b7] text-white" : ""}
            onClick={() => handleCategoryClick(cat.id)}
          >
            #{cat.name} <span className="ml-1 text-xs text-gray-400">({cat.postCount})</span>
          </Button>
        ))}
      </div>
    </div>
  );
} 