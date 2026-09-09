"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWallet } from "@/services/walletService";
import { getCurrentUser } from "@/services/userService";
import { getPortfolio } from "@/services/portfolioService";

type Holding = {
  stock_id: number;
  symbol: string;
  name: string;
  quantity: number;
  current_price: number;
  market_value: number;
};

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [walletData, userData, portfolioData] =
          await Promise.all([
            getWallet(),
            getCurrentUser(),
            getPortfolio(),
          ]);

        setBalance(walletData.balance);
        setUsername(userData.username);
        setHoldings(portfolioData);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const portfolioValue = holdings.reduce(
    (total, holding) => total + holding.market_value,
    0
  );

  const stocksOwned = holdings.reduce(
    (total, holding) => total + holding.quantity,
    0
  );

  const accountEquity = balance + portfolioValue;

  const formatMoney = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7FAF7]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7FAF7] text-gray-900">
      {/* Dark Green Header */}
      <header className="bg-[#14532D] px-6 py-5 text-white shadow-md md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              Stock Exchange Engine
            </h1>

            <p className="mt-1 text-sm text-green-100">
              Trading Dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-[#14532D]"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
            Overview
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#14532D]">
            Welcome back{username ? `, ${username}` : ""}
          </h2>

          <p className="mt-2 text-gray-500">
            Track your balance, investments and current holdings.
          </p>
        </div>

        {/* Main Account Card */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#14532D] to-[#15803D] p-7 text-white shadow-lg">
          {/* Decorative orange circle */}
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-400/20" />
          <div className="absolute -bottom-16 right-28 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-green-100">
                Total Account Equity
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
                {formatMoney(accountEquity)}
              </p>

              <p className="mt-3 text-sm text-green-100/80">
                Available cash + current portfolio value
              </p>
            </div>

            <Link
              href="/stocks"
              className="inline-flex w-fit items-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600"
            >
              Trade Markets →
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          <SummaryCard
            label="Available Balance"
            value={formatMoney(balance)}
            description="Ready to trade"
            accent="green"
          />

          <SummaryCard
            label="Portfolio Value"
            value={formatMoney(portfolioValue)}
            description="Current market value"
            accent="orange"
          />

          <SummaryCard
            label="Assets Owned"
            value={stocksOwned.toLocaleString()}
            description={`${holdings.length} different assets`}
            accent="green"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Holdings */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="font-bold text-[#14532D]">
                  Your Holdings
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Current portfolio positions
                </p>
              </div>

              <Link
                href="/portfolio"
                className="text-sm font-semibold text-orange-500 transition hover:text-orange-600"
              >
                View all →
              </Link>
            </div>

            {holdings.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl font-bold text-green-700">
                  $
                </div>

                <p className="mt-4 font-semibold text-gray-800">
                  No assets yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Start trading to build your portfolio.
                </p>

                <Link
                  href="/stocks"
                  className="mt-5 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Browse Markets
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F7FAF7] text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">
                        Asset
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Quantity
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Price
                      </th>

                      <th className="px-6 py-4 text-right font-semibold">
                        Value
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {holdings.slice(0, 5).map((holding) => (
                      <tr
                        key={holding.stock_id}
                        className="border-t border-gray-100 transition hover:bg-green-50/50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#14532D]">
                            {holding.symbol}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {holding.name}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {holding.quantity}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {formatMoney(holding.current_price)}
                        </td>

                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          {formatMoney(holding.market_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Allocation */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-1 h-1 w-10 rounded-full bg-orange-500" />

            <h3 className="mt-4 font-bold text-[#14532D]">
              Portfolio Allocation
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Distribution by market value
            </p>

            <div className="mt-7 space-y-6">
              {holdings.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  No portfolio data available.
                </p>
              ) : (
                holdings
                  .slice()
                  .sort(
                    (a, b) =>
                      b.market_value - a.market_value
                  )
                  .slice(0, 5)
                  .map((holding, index) => {
                    const percentage =
                      portfolioValue > 0
                        ? (holding.market_value /
                            portfolioValue) *
                          100
                        : 0;

                    return (
                      <div key={holding.stock_id}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-700">
                            {holding.symbol}
                          </span>

                          <span className="font-semibold text-gray-500">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${
                              index % 2 === 0
                                ? "bg-green-600"
                                : "bg-orange-500"
                            }`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-full bg-orange-500" />

            <h3 className="text-lg font-bold text-[#14532D]">
              Quick Actions
            </h3>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <QuickAction
              href="/stocks"
              title="Browse Markets"
              description="View live prices and trade assets."
              accent="green"
            />

            <QuickAction
              href="/portfolio"
              title="Portfolio"
              description="Review all your current holdings."
              accent="orange"
            />

            <QuickAction
              href="/transactions"
              title="Transactions"
              description="View your complete trading history."
              accent="green"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string;
  description: string;
  accent: "green" | "orange";
}) {
  const isGreen = accent === "green";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          isGreen ? "bg-green-600" : "bg-orange-500"
        }`}
      />

      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
          isGreen
            ? "bg-green-50 text-green-700"
            : "bg-orange-50 text-orange-600"
        }`}
      >
        <span className="text-lg font-bold">
          {isGreen ? "$" : "↗"}
        </span>
      </div>

      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  accent: "green" | "orange";
}) {
  const isGreen = accent === "green";

  return (
    <Link
      href={href}
      className={`group rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        isGreen
          ? "border-green-100 hover:border-green-300"
          : "border-orange-100 hover:border-orange-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`font-bold ${
            isGreen
              ? "text-[#14532D]"
              : "text-orange-600"
          }`}
        >
          {title}
        </p>

        <span
          className={`transition group-hover:translate-x-1 ${
            isGreen
              ? "text-green-600"
              : "text-orange-500"
          }`}
        >
          →
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>
    </Link>
  );
}