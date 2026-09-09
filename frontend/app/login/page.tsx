"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      // Save JWT token
      localStorage.setItem("token", data.access_token);

      // Go to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F7FAF7] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-green-100/70 sm:-left-32 sm:-top-32 sm:h-80 sm:w-80" />

      <div className="pointer-events-none absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-orange-100/70 sm:-bottom-40 sm:-right-32 sm:h-96 sm:w-96" />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14532D] text-lg font-bold text-white shadow-lg sm:h-14 sm:w-14 sm:text-xl">
            S
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500 sm:text-sm sm:tracking-[0.2em]">
            Trading Platform
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-[#14532D] sm:text-3xl">
            Stock Exchange Engine
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Sign in to manage your portfolio and trade live assets.
          </p>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="h-1.5 bg-gradient-to-r from-green-600 via-green-500 to-orange-500" />

          <div className="p-5 sm:p-6 md:p-8">
            <div className="mb-5 sm:mb-6">
              <h2 className="text-lg font-bold text-[#14532D] sm:text-xl">
                Welcome back
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Enter your account details to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:text-base"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:text-base"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        {/* Register Link */}
        <p className="mt-5 text-center text-sm leading-6 text-gray-500 sm:mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-orange-500 transition hover:text-orange-600"
          >
            Create one
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400 sm:mt-8">
          Stock Exchange Engine
        </p>
      </div>
    </main>
  );
}