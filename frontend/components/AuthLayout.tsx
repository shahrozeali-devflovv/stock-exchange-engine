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

    if (!loggedIn && !publicPages.includes(pathname)) {
      router.replace("/register");
      return;
    }

    if (loggedIn && publicPages.includes(pathname)) {
      router.replace("/dashboard");
      return;
    }

    setChecked(true);
  }, [pathname, router]);

  if (!checked) {
    return null;
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/stocks", label: "Stocks" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/transactions", label: "Transactions" },
  ];

  return (
    <>
      {isLoggedIn && (
        <nav className="border-b border-green-800 bg-[#14532D] text-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 font-bold text-white">
                S
              </div>

              <div>
                <p className="text-lg font-bold leading-none">
                  Stock Exchange
                </p>

                <p className="mt-1 text-xs text-green-200">
                  Trading Engine
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              {navLinks.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-green-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {children}
    </>
  );
}