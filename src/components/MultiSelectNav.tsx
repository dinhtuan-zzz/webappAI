"use client";
import { Button } from "@/components/ui/button";

/**
 * MultiSelectOptionBase - Base type for options used in MultiSelectNav.
 * @property {string} label - The display label for the option.
 * @property {string} value - The unique value for the option.
 * @property {number} [count] - Optional count badge (e.g., post count).
 */
export type MultiSelectOptionBase = {
  label: string;
  value: string;
  count?: number;
};

/**
 * Props for MultiSelectNav.
 * @template T - Option type extending MultiSelectOptionBase
 * @property {string} label - The label for the filter group.
 * @property {T[]} options - The selectable options.
 * @property {string[]} selected - The currently selected values.
 * @property {(ids: string[]) => void} onSelect - Handler for selection changes.
 * @property {boolean} [loading] - Show loading state.
 * @property {string} [error] - Error message to display.
 * @property {string} [allLabel] - Label for the 'All' button (default: 'Tất cả').
 */
export interface MultiSelectNavProps<T extends MultiSelectOptionBase = MultiSelectOptionBase> {
  label: string;
  options: T[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  loading?: boolean;
  error?: string;
  allLabel?: string;
}

/**
 * MultiSelectNav - A reusable multi-select filter component for categories, statuses, etc.
 *
 * @template T - Option type extending MultiSelectOptionBase
 * @param {MultiSelectNavProps<T>} props - Component props
 * @returns {JSX.Element}
 *
 * @example
 * <MultiSelectNav<CategoryOption>
 *   label="Chuyên mục:"
 *   options={categoryOptions}
 *   selected={selectedCategories}
 *   onSelect={setSelectedCategories}
 *   loading={categoriesLoading}
 *   error={categoriesError ? "Không thể tải chuyên mục." : ""}
 *   allLabel="Tất cả"
 * />
 */
export function MultiSelectNav<T extends MultiSelectOptionBase = MultiSelectOptionBase>({
  label,
  options = [],
  selected = [],
  onSelect,
  loading = false,
  error = "",
  allLabel = "Tất cả",
}: MultiSelectNavProps<T>) {
  const handleClick = (value: string) => {
    if (selected.includes(value)) {
      onSelect(selected.filter((v) => v !== value));
    } else {
      onSelect([...selected, value]);
    }
  };
  const handleAllClick = () => onSelect([]);

  return (
    <div className="w-full mb-2">
      <div className="mb-1 font-medium text-sm text-[#2a4257]">{label}</div>
      {loading ? (
        <div className="text-gray-400 text-sm">Đang tải...</div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : (
        <div className="flex gap-2 flex-wrap whitespace-nowrap">
          <Button
            variant={selected.length === 0 ? "default" : "outline"}
            size="sm"
            className={selected.length === 0 ? "bg-[#6bb7b7] text-white" : ""}
            onClick={handleAllClick}
          >
            #{allLabel}
          </Button>
          {options.map((opt) => (
            <Button
              key={opt.value}
              variant={selected.includes(opt.value) ? "default" : "outline"}
              size="sm"
              className={selected.includes(opt.value) ? "bg-[#6bb7b7] text-white" : ""}
              onClick={() => handleClick(opt.value)}
            >
              #{opt.label}
              {typeof opt.count === "number" && (
                <span className="ml-1 text-xs text-gray-400">({opt.count})</span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
} 