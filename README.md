# Lavie Manga Blog

A modern, robust manga blog platform built with **Next.js**, **Prisma**, **PostgreSQL**, and **TypeScript**. Lavie is designed for extensibility, type safety, and maintainability, with a focus on admin/user post filtering, session management, and a clean, reusable component architecture.

---

## 🚀 Features
- **User Authentication** (NextAuth.js: credentials & Google)
- **Role-based Access Control** (Admin, User)
- **Session Management** (view, revoke, device/IP/location tracking)
- **Blog Posts** with categories, tags, media, comments, and votes
- **Image Upload & Optimization**: Client-side compression, server-side resizing/compression, and Next.js image optimization for all post thumbnails
- **Admin Panel**: CRUD, search, filters (category, status, date), pagination
- **User Panel**: Profile, settings, notifications, session/device management
- **Reusable UI Components** (MultiSelectNav, DateFilter, SearchBar, etc.)
- **Type Safety**: End-to-end with TypeScript and Zod
- **Prisma ORM** with PostgreSQL
- **Easy Database Seeding** for development
- **Comprehensive Integration Tests** for public/stateless endpoints
- **Admin Post Management**: List, view, edit, and delete posts with robust UI, server-side protection, and advanced accessibility/UX features.

---

## 🛠️ Tech Stack
- **Next.js 15** (App Router, TypeScript)
- **Prisma** ORM
- **PostgreSQL**
- **NextAuth.js** (credentials, Google)
- **Zod** (runtime validation)
- **Jest** (integration testing)
- **Tailwind CSS**

---

## 📁 Project Structure

```
/ (root)
├── src/
│   ├── app/                # Next.js app directory (pages, layouts, API)
│   │   ├── api/            # API endpoints (REST, app directory handlers)
│   │   ├── admin/          # Admin dashboard (posts, users, categories, comments)
│   │   ├── user/           # User dashboard (profile, settings, sessions)
│   │   ├── post/           # Post detail pages
│   │   └── ...             # Auth, search, register, etc.
│   ├── components/         # Reusable UI components
│   ├── types/              # TypeScript domain models & API types
│   ├── lib/                # Utilities, Prisma client, auth logic
│   ├── __tests__/          # Integration tests (Jest)
│   └── ...
├── prisma/                 # Prisma schema, migrations, seed script
├── public/                 # Static assets
├── .env                    # Environment variables
├── package.json            # Scripts & dependencies
└── README.md               # Project documentation
```

---

## ⚡ Getting Started

1. **Clone the Repository**
   ```sh
   git clone https://github.com/yourusername/lavie-manga-blog.git
   cd lavie-manga-blog
   ```
2. **Install Dependencies**
   ```sh
   npm install
   ```
3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` and fill in your database and auth credentials.
4. **Set Up the Database**
   ```sh
   npx prisma migrate dev --name init
   npx prisma generate
   npx prisma db seed
   ```
5. **Start the Dev Server**
   ```sh
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database & Prisma
- **Schema:** See `prisma/schema.prisma` for models (User, Post, Category, Comment, Session, etc.)
- **Migrations:** In `prisma/migrations/`
- **Seeding:** `prisma/seed.ts` inserts sample users, roles, posts, categories, etc.
- **Studio:**
  ```sh
  npx prisma studio
  ```

---

## 🖼️ Image Upload & Optimization

Lavie features a robust, production-grade image upload pipeline for post thumbnails:

### **1. Client-Side (Browser)**
- Users crop images to 16:9 before upload.
- Images are compressed and resized in-browser using [`browser-image-compression`](https://www.npmjs.com/package/browser-image-compression):
  - Max size: 0.5MB
  - Max width/height: 1280px
  - Format: JPEG
- This ensures fast uploads and reduced bandwidth usage.

### **2. Server-Side (API: `/api/upload`)**
- Images are received via a Next.js API route using `formidable`.
- All images are processed with [`sharp`](https://www.npmjs.com/package/sharp)`:
  - Resized to max width 1280px (no enlargement)
  - Converted to JPEG (80% quality)
  - Saved as `.jpg` in `/public/uploads/` with a unique filename
- The API returns the image URL to the frontend.

### **3. Database**
- Only the image URL (e.g., `/uploads/abc123.jpg`) is stored in the `thumbnail` field of the `Post` record.

### **4. Frontend Rendering**
- All post thumbnails are rendered using Next.js `<Image />`, which:
  - Delivers responsive, optimized images
  - Serves modern formats (WebP/AVIF) when possible
  - Handles lazy loading and sizing automatically

### **Benefits**
- Fast uploads and page loads
- Consistent, optimized images
- Minimal storage and bandwidth usage
- Extensible for future enhancements (WebP, CDN, etc.)

---

## 🧩 Components & UI
- **Reusable:** All major UI elements (MultiSelectNav, DateFilter, SearchBar, etc.) are in `src/components/`
- **Admin & User Panels:** Modular, type-safe, and extensible
- **Docs:** See `src/components/MultiSelectNav.README.md` for filter UI patterns

---

## 🧬 Type Safety
- **Types:** All domain models and API types in `src/types/`
- **Validation:** Zod schemas for all API input
- **No `any`/`unknown`:** Strict typing enforced throughout

---

## 🔌 API Structure (App Directory)

Lavie uses Next.js app directory API routes. Handlers are in `src/app/api/` and are fully type-safe and Zod-validated.

### **Key Endpoints**

#### **Public/Stateless (fully tested)**
- `GET /api/categories` — List all categories
- `GET /api/posts` — List posts (filters: search, categoryIds, pagination)
- `GET /api/posts/trending` — Trending posts
- `GET /api/search` — Search posts (q, categories, date)

#### **Authenticated/Admin (require E2E for full test)**
- `GET /api/admin/posts` — Admin post list (filters, pagination)
- `PATCH /api/admin/posts/[postId]` — Update post (admin)
- `GET|PATCH /api/users/[username]/profile` — User profile
- `GET|PATCH /api/users/[username]/notifications` — Notification prefs
- `GET|DELETE /api/users/[username]/sessions` — Session management
- `POST /api/posts/[postId]/comments` — Add comment
- `POST /api/posts/[postId]/vote` — Vote on post
- `PUT|DELETE /api/comments/[commentId]` — Edit/delete comment
- `POST /api/auth/register` — Register
- `POST /api/auth/[...nextauth]` — Auth (NextAuth.js)

> **See `src/app/api/` for the full endpoint list.**

---

## 🧪 Testing

- **Integration tests:** All public/stateless endpoints are covered in `src/__tests__` using Jest.
- **Edge cases:** Filters, pagination, empty results, invalid input, etc.
- **Type safety:** All test inputs/outputs are strictly typed.
- **Authenticated/admin endpoints:** Require E2E or Next.js test utilities for full coverage.

### **Run tests:**
```sh
npm run test
```

---

## 🧑‍💻 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/foo`)
3. Commit your changes (`git commit -am 'Add foo'`)
4. Push to the branch (`git push origin feature/foo`)
5. Create a new Pull Request

---

## 📚 Credits
- [Next.js](https://nextjs.org/)
- [Prisma](https://prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [NextAuth.js](https://next-auth.js.org/)
- [Lucide Icons](https://lucide.dev/)
- [Sonner](https://sonner.emilkowal.ski/) (for toasts)

---

## 📬 Contact
For questions or support, open an issue or contact [your email/contact here].

## Post Filtering UI & Logic (Admin & User)

This section documents the architecture and implementation of robust, reusable filter functionality for posts (category, status, date, search) in both user and admin panels.

---

### 1. UI Components

#### A. MultiSelectNav (Global, Reusable)
- Renders filter chips/buttons for multi-select filtering (categories, statuses, etc.).
- Props: `label`, `options`, `selected`, `onSelect`, `allLabel`, `loading`, `error`.
- Features: "All" button, count badge, type-safe, extensible.

#### B. DateFilter
- Renders date range filter (all, today, week, month, year).

#### C. SearchBar
- Input for keyword search.

---

### 2. Data Fetching & State
- **Categories:** Fetched from `/api/categories` (returns all categories with post counts).
- **Posts:** Fetched from `/api/posts` (user) or `/api/admin/posts` (admin), includes `categories` for each post.
- **Selected Filters:** `selectedCategories`, `selectedStatuses` (admin), `date`, `search`.

---

### 3. Filtering Logic

#### A. Client-Side Filtering (User Landing Page)
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

#### B. Server-Side Filtering (Admin Panel)
- API receives all filter params: `categories`, `status`, `date`, `search`, `page`, `pageSize`.
- API logic: Filters posts by all criteria and returns paginated, filtered posts with categories included.

---

### 4. UI Layout Example

```tsx
<div className="flex flex-col gap-4 mb-4">
  <SearchBar ... />
  <MultiSelectNav ... /> {/* Categories */}
  <MultiSelectNav ... /> {/* Statuses (admin) */}
  <DateFilter ... />
</div>
```

---

### 5. Best Practices & Extensibility
- Type safety with generics for filter options.
- useMemo for derived options.
- Reuse MultiSelectNav for any multi-select filter.
- "All" button handled by the component, not the options array.
- Backend: Always include necessary relations (e.g., categories) in API responses for filtering.

---

### 6. Example Usage (Admin Posts Page)

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

### 7. Troubleshooting Checklist
- Ensure all filter options exist in the database.
- Ensure API responses include all necessary fields for filtering.
- Ensure client-side filter logic matches the data structure returned by the API.

---

This architecture ensures your filter UI is robust, maintainable, and easily extensible for future needs.

## Feature Documentation

- [Post Filtering UI & Logic (Admin & User)](src/components/MultiSelectNav.README.md)

## 🛡️ Accessibility & UX Improvements (Admin Posts)

The admin posts management interface is designed for modern accessibility and usability:

- **Accessible Delete Dialog**: Confirmation dialog uses semantic `<DialogTitle>` and `<DialogDescription>` for screen readers, and only appears when triggered.
- **Focus Management**: 
  - Auto-focuses the Cancel button when the dialog opens for keyboard users.
  - Returns focus to the delete icon after closing the dialog for seamless navigation.
- **Undo Feature**: 
  - After deleting a post, a toast appears with an auto-focused Undo button for quick keyboard access.
  - Undo restores the post and refreshes the list instantly.
- **Destructive Action Styling**: Delete actions are visually distinct and safe.
- **Loading State**: Shows progress indicator on destructive actions.
- **Mobile Responsiveness**: Dialog and table are fully responsive and usable on all screen sizes.
- **Keyboard & Screen Reader Friendly**: All actions are reachable and announced appropriately.

These improvements ensure a robust, user-friendly, and accessible admin experience.