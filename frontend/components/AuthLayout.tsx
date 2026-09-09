"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = !!token;

    setIsLoggedIn(loggedIn);

    const publicPages = ["/register", "/login"];

    // Not logged in → only login/register allowed
    if (!loggedIn && !publicPages.includes(pathname)) {
      router.replace("/register");
      return;
    }

    // Already logged in → don't show login/register
    if (loggedIn && publicPages.includes(pathname)) {
      router.replace("/dashboard");
      return;
    }

    setChecked(true);
  }, [pathname, router]);

  if (!checked) {
    return null;
  }

  return (
    <>
      {isLoggedIn && (
        <nav className="border-b border-slate-800 bg-slate-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/dashboard" className="text-xl font-bold">
              Stock Exchange
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-slate-300 transition hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/stocks"
                className="text-slate-300 transition hover:text-white"
              >
                Stocks
              </Link>

              <Link
                href="/portfolio"
                className="text-slate-300 transition hover:text-white"
              >
                Portfolio
              </Link>

              <Link
                href="/transactions"
                className="text-slate-300 transition hover:text-white"
              >
                Transactions
              </Link>
            </div>
          </div>
        </nav>
      )}

      {children}
    </>
  );
}