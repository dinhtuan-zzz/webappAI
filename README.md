# Lavie Manga Blog

A modern, robust manga blog platform built with **Next.js**, **Prisma**, **PostgreSQL**, and **TypeScript**. Lavie is designed for extensibility, type safety, and maintainability, with a focus on admin/user post filtering, session management, and a clean, reusable component architecture.

---

## 🚀 Features
- **User Authentication** (NextAuth.js: credentials & Google)
- **Role-based Access Control** (Admin, User)
- **Session Management** (view, revoke, device/IP/location tracking)
- **Real-Time Notifications**: In-app notification bell with real-time updates (WebSocket), instant badge updates, robust optimistic UI, mark all as read, relative timestamps ("2 minutes ago"), and extensible notification types.
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

## 📝 Recent Comment System Improvements (2024-06)

- **Jump to Comment Form Button:**
  - A compact, right-aligned "Jump" button appears at the bottom of the comment thread, allowing users to quickly return to the comment form. The button uses a light blue color, is responsive, and is accessible with an icon, tooltip, and ARIA label.

- **Scroll to New Comment:**
  - When a user posts a new comment, the UI automatically scrolls to the newly created comment (both for optimistic and confirmed states), ensuring immediate feedback and visibility even in long threads.

- **Accessibility & Navigation:**
  - All comment actions and navigation buttons are keyboard accessible and screen reader friendly.
  - ARIA labels, roles, and tooltips are used throughout for clarity and accessibility.
  - Responsive design ensures comments and controls look great on all screen sizes.

- **Best Practices:**
  - Only one navigation button ("Jump") is shown for clarity and minimalism.
  - Button text is compact and hidden on mobile, visible on larger screens or on hover/focus.
  - Comment containers use unique IDs for robust scroll targeting.

## ✅ Checklist (Task List) UX & CSS Improvements (2024-06)

- **Robust Checklist Alignment & Nesting:**
  - Checklists (task lists) now render with checkboxes and text perfectly aligned on the same line in the editor, preview, and comment display.
  - Nested checklists are always indented and start on a new line, matching best-practice UX for task lists.
- **Consistent Experience Across Views:**
  - Fixed differences between editor, preview, and comment display by targeting both `.tiptap-editor` and `.comment-readonly.tiptap-editor` in CSS.
  - Ensured that checkboxes and text remain horizontally aligned regardless of HTML structure (whether text is in a `<div><p>` or direct `<p>`).
- **Accessibility & Visual Polish:**
  - Increased checkbox size for better visibility and accessibility.
  - Disabled checkboxes in comment display for read-only UX, with consistent accent color.
  - All list types (bullet, numbered, checklist) now have visually distinct, accessible, and maintainable styles.
- **Maintainability:**
  - CSS is now robust to future HTML changes from TipTap, using block layout for `<li>`, inline-block for `<label>` and `<p>`, and restoring indentation for nested checklists.
  - All changes are documented and follow best practices for extensibility and reusability.

---

## 🖋️ Editor & Comment UX Improvements (2024-06)

- **Tiptap Image Upload & Display**
  - Refactored the image upload button to use the standard Tiptap `"image"` node.
  - Added a file picker and upload flow: images are uploaded to `/api/upload`, and the returned URL is inserted into the editor.
  - Images are responsive in the editor with CSS (`max-width: 100%`, `max-height: 400px`, `object-fit: contain`).
  - Editor now grows vertically with content (no `max-height`), providing a document-like experience.

- **Collapsible Long Comments (Voz/XenForo Style)**
  - Implemented a reusable `CollapsibleComment` component:
    - Collapses comments taller than 300px.
    - Shows a fade-out effect and a "Show more" button.
    - Expands/collapses on click, keeping the UI clean for long comments.
  - Integrated `CollapsibleComment` into comment rendering so all long comments are now collapsed by default.

- **Fade-Out Visual Improvements**
  - Fade-out color is now theme-aware:
    - Light mode: soft blue (`#e8ecf1`)
    - Dark mode: dark blue-gray (`#1e293b`)
  - Switched from media query to `.dark` class for dark mode, ensuring the fade always matches your app's actual theme.
  - Used `!important` to ensure the fade color is never overridden.

- **General UX/Code Quality**
  - All changes follow best practices for maintainability, accessibility, and modern UI/UX.
  - Solutions are reusable and extensible for future needs.

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
│   │   ├── notifications/   # NotificationBell, NotificationDropdown, NotificationItem, etc.
│   │   └── ...             # New components
│   ├── hooks/
│   │   └── useNotifications.ts # Notification state, SWR, WebSocket logic
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
- `GET /api/users/[username]/notifications/list` — List notifications (paginated)
- `POST /api/users/[username]/notifications/mark-all-read` — Mark all as read
- `POST /api/users/[username]/notifications/mark-read` — Mark specific notifications as read
- `PATCH /api/users/[username]/notifications` — Update notification preferences
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