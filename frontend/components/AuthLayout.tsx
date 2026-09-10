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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = !!token;

    setIsLoggedIn(loggedIn);

    const publicPages = ["/register", "/login"];

    if (!loggedIn && !publicPages.includes(pathname)) {
      router.replace("/login");
      return;
    }

    if (loggedIn && publicPages.includes(pathname)) {
      router.replace("/dashboard");
      return;
    }

    setChecked(true);
  }, [pathname, router]);

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    <div className="min-h-screen w-full">
      {isLoggedIn && (
        <nav className="sticky top-0 z-50 border-b border-green-800 bg-[#14532D] text-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link
                href="/dashboard"
                className="flex min-w-0 items-center gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 font-bold text-white shadow-sm">
                  S
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-bold leading-none sm:text-lg">
                    Stock Exchange
                  </p>

                  <p className="mt-1 hidden text-xs text-green-200 sm:block">
                    Trading Engine
                  </p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden items-center gap-1 lg:flex">
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

              {/* Mobile / Tablet Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-green-100 transition hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  /* Close Icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  /* Hamburger Icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile / Tablet Navigation */}
            {mobileMenuOpen && (
              <div className="border-t border-white/10 py-3 lg:hidden">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const active = pathname === link.href;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
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
            )}
          </div>
        </nav>
      )}

      <main className="w-full min-w-0">{children}</main>
    </div>
  );
}