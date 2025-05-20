import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, background: "#f5f5f5", padding: 24 }}>
        <h2 style={{ marginBottom: 32 }}>Admin Panel</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/posts">Posts</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/categories">Categories</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
} 