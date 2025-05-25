import * as React from "react";
import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { X, Plus } from "lucide-react";
import { FixedSizeList as List } from "react-window";
import type { SelectOption } from '@/types';

type CategorySelectOption = SelectOption & { archived?: boolean; postCount?: number };

interface MultiCategorySelectProps {
  value: CategorySelectOption[];
  onChange: (categories: CategorySelectOption[]) => void;
  options: CategorySelectOption[];
  required?: boolean;
  error?: string;
  onCreate?: (name: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiCategorySelect({
  value,
  onChange,
  options,
  onCreate,
  required,
  error,
  label = "Categories",
  placeholder = "Select or create categories...",
  disabled,
}: MultiCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedIds = useMemo(() => value.map((c: CategorySelectOption) => c.value), [value]);

  // Filter options by search and exclude already selected
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const safeOptions = Array.isArray(options) ? options : [];
    return safeOptions.filter(
      (cat: CategorySelectOption) =>
        cat && cat.value && // Defensive check
        !selectedIds.includes(cat.value) &&
        (cat.label.toLowerCase().includes(q) || (cat.archived && "archived".includes(q)))
    );
  }, [search, options, selectedIds]);

  // Handle create new
  const canCreate =
    onCreate &&
    search.trim().length > 0 &&
    !options.some((cat: CategorySelectOption) => cat.label.toLowerCase() === search.trim().toLowerCase());

  // Handle remove
  const handleRemove = (val: string) => {
    onChange(value.filter((cat: CategorySelectOption) => cat.value !== val));
  };

  // Handle select
  const handleSelect = (cat: CategorySelectOption) => {
    onChange([...value, cat]);
    setSearch("");
    setOpen(false);
  };

  // Handle create
  const handleCreate = () => {
    if (onCreate && canCreate) {
      onCreate(search.trim());
      setSearch("");
      setOpen(false);
    }
  };

  // Virtualized row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const cat = filteredOptions[index];
    return (
      <DropdownMenuItem
        key={cat.value}
        onSelect={() => handleSelect(cat)}
        className="flex justify-between items-center"
        aria-selected={false}
        role="option"
        style={style}
      >
        <span>{cat.label}</span>
        {typeof cat.postCount === "number" && (
          <span className="ml-2 text-xs text-gray-400">{cat.postCount} posts</span>
        )}
      </DropdownMenuItem>
    );
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block font-semibold mb-1" htmlFor="multi-category-select">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {/* Chips above the trigger button */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {value.map((cat: CategorySelectOption) => (
            <span
              key={cat.value}
              className={
                "inline-flex items-center bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5 text-xs font-medium text-teal-800 mr-1 mb-1" +
                (cat.archived ? " bg-gray-200 text-gray-500 border-gray-300" : "")
              }
            >
              {cat.label}
              {cat.archived && <span className="ml-1 text-xs">(Archived)</span>}
              <button
                type="button"
                className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
                aria-label={`Remove ${cat.label}`}
                onClick={() => handleRemove(cat.value)}
                tabIndex={0}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start min-h-[44px] gap-2"
            aria-haspopup="listbox"
            aria-expanded={open}
            id="multi-category-select"
            disabled={disabled}
          >
            {value.length === 0 ? (
              <span className="text-gray-400">{placeholder}</span>
            ) : (
              <span className="text-gray-400">Add category</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[320px] max-h-72 overflow-y-auto p-2" align="start">
          <Input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="mb-2"
            onKeyDown={e => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                handleCreate();
              }
            }}
            aria-label="Search categories"
          />
          {filteredOptions.length === 0 && !canCreate && (
            <div className="text-gray-400 text-sm px-2 py-1">No categories found.</div>
          )}
          {filteredOptions.length > 0 && (
            <List
              height={180}
              itemCount={filteredOptions.length}
              itemSize={40}
              width={300}
            >
              {Row}
            </List>
          )}
          {canCreate && (
            <DropdownMenuItem onSelect={handleCreate} className="flex items-center text-green-600">
              <Plus className="w-4 h-4 mr-1" />Create "{search.trim()}"
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
} 