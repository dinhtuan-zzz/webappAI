import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel. Use the sidebar to manage resources.</p>
      <ul style={{ marginTop: 24 }}>
        <li><Link href="/admin/posts">Manage Posts</Link></li>
        <li><Link href="/admin/users">Manage Users</Link></li>
        <li><Link href="/admin/categories">Manage Categories</Link></li>
      </ul>
    </div>
  );
} 