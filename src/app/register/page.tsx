"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1200);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafc] via-[#e6f0f7] to-[#f3f7f4]">
      <div className="bg-white/90 dark:bg-[#23272f] rounded-xl shadow-lg p-8 w-full max-w-md border border-[#e6e6e6] flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-[#2a4257] text-center mb-2">Create your account</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#2a4257] mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e6e6e6] rounded focus:outline-none focus:ring-2 focus:ring-[#6bb7b7] bg-white dark:bg-[#23272f]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2a4257] mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e6e6e6] rounded focus:outline-none focus:ring-2 focus:ring-[#6bb7b7] bg-white dark:bg-[#23272f]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2a4257] mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e6e6e6] rounded focus:outline-none focus:ring-2 focus:ring-[#6bb7b7] bg-white dark:bg-[#23272f]"
            />
          </div>
          <Button type="submit" className="w-full bg-[#6bb7b7] hover:bg-[#4e9a9a] text-white font-semibold mt-2" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
        {error && <div className="text-center text-sm text-red-500">{error}</div>}
        {success && <div className="text-center text-sm text-green-600">Registration successful! Redirecting...</div>}
        <div className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-[#6bb7b7] hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 