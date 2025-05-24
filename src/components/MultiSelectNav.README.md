# Post Filtering UI & Logic (Admin & User)

This document describes the architecture and implementation of robust, reusable filter functionality for posts (category, status, date, search) in both user and admin panels.

---

## 1. UI Components

### A. MultiSelectNav (Global, Reusable)
- Renders filter chips/buttons for multi-select filtering (categories, statuses, etc.).
- Props: `label`, `options`, `selected`, `onSelect`, `allLabel`, `loading`, `error`.
- Features: "All" button, count badge, type-safe, extensible.

### B. DateFilter
- Renders date range filter (all, today, week, month, year).

### C. SearchBar
- Input for keyword search.

---

## 2. Data Fetching & State
- **Categories:** Fetched from `/api/categories` (returns all categories with post counts).
- **Posts:** Fetched from `/api/posts` (user) or `/api/admin/posts` (admin), includes `categories` for each post.
- **Selected Filters:** `selectedCategories`, `selectedStatuses` (admin), `date`, `search`.

---

## 3. Filtering Logic

### A. Client-Side Filtering (User Landing Page)
- **Category Filter (OR logic):**
  ```ts
  filtered = filtered.filter((post: Post) =>
    post.categories && post.categories.some((cat: any) => selectedCategories.includes(cat.category.id))
  );
  ```
- **Search Filter:**
  ```ts
  filtered = filtered.filter((post: Post) =>
    post.title.toLowerCase().includes(q) ||
    (post.summary && post.summary.toLowerCase().includes(q)) ||
    (post.tags && post.tags.some((t: any) => t.tag.name.toLowerCase().includes(q)))
  );
  ```

### B. Server-Side Filtering (Admin Panel)
- API receives all filter params: `categories`, `status`, `date`, `search`, `page`, `pageSize`.
- API logic: Filters posts by all criteria and returns paginated, filtered posts with categories included.

---

## 4. UI Layout Example

```tsx
<div className="flex flex-col gap-4 mb-4">
  <SearchBar ... />
  <MultiSelectNav ... /> {/* Categories */}
  <MultiSelectNav ... /> {/* Statuses (admin) */}
  <DateFilter ... />
</div>
```

---

## 5. Best Practices & Extensibility
- Type safety with generics for filter options.
- useMemo for derived options.
- Reuse MultiSelectNav for any multi-select filter.
- "All" button handled by the component, not the options array.
- Backend: Always include necessary relations (e.g., categories) in API responses for filtering.

---

## 6. Example Usage (Admin Posts Page)

```tsx
<MultiSelectNav<CategoryOption>
  label="Chuyên mục:"
  options={categoryOptions}
  selected={selectedCategories}
  onSelect={setSelectedCategories}
  loading={categoriesLoading}
  error={categoriesError ? "Không thể tải chuyên mục." : ""}
  allLabel="Tất cả"
/>
<MultiSelectNav<StatusOption>
  label="Trạng thái:"
  options={statusOptions}
  selected={selectedStatuses}
  onSelect={setSelectedStatuses}
  allLabel="Tất cả"
/>
<DateFilter value={date} onChange={setDate} />
```

---

## 7. Troubleshooting Checklist
- Ensure all filter options exist in the database.
- Ensure API responses include all necessary fields for filtering.
- Ensure client-side filter logic matches the data structure returned by the API.

---

This architecture ensures your filter UI is robust, maintainable, and easily extensible for future needs. 