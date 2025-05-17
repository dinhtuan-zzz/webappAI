"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
    } else if (res?.ok) {
      router.replace("/");
    }
    setLoading(false);
  }

  // Show error from NextAuth (e.g. ?error=...) if present
  const urlError = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7fafc] via-[#e6f0f7] to-[#f3f7f4]">
      <div className="bg-white/90 dark:bg-[#23272f] rounded-xl shadow-lg p-8 w-full max-w-md border border-[#e6e6e6] flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-[#2a4257] text-center mb-2">Sign in to Lavie</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e6e6e6] rounded focus:outline-none focus:ring-2 focus:ring-[#6bb7b7] bg-white dark:bg-[#23272f]"
            />
          </div>
          <Button type="submit" className="w-full bg-[#6bb7b7] hover:bg-[#4e9a9a] text-white font-semibold mt-2" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        {(error || urlError) && (
          <div className="text-center text-sm text-red-500">{error || urlError}</div>
        )}
        <div className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#6bb7b7] hover:underline font-medium">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
} 