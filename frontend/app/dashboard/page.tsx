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
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F7FAF7] px-4">
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
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7FAF7] text-gray-900">
      {/* Dashboard Header */}
      <header className="bg-[#14532D] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
              Stock Exchange Engine
            </h1>

            <p className="mt-1 text-xs text-green-100 sm:text-sm">
              Trading Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-[#14532D] sm:px-4 sm:text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-500 sm:text-sm">
            Overview
          </p>

          <h2 className="mt-2 break-words text-2xl font-bold tracking-tight text-[#14532D] sm:text-3xl lg:text-4xl">
            Welcome back{username ? `, ${username}` : ""}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Track your balance, investments and current holdings.
          </p>
        </div>

        {/* Main Account Card */}
        <div className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#14532D] to-[#15803D] p-5 text-white shadow-lg sm:mb-6 sm:p-7">
          {/* Decorative Circles */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-400/20 sm:h-40 sm:w-40" />

          <div className="pointer-events-none absolute -bottom-16 right-10 h-28 w-28 rounded-full bg-white/5 sm:right-28 sm:h-32 sm:w-32" />

          <div className="relative flex flex-col gap-6 sm:gap-8 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-green-100 sm:text-sm">
                Total Account Equity
              </p>

              <p className="mt-2 break-all text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {formatMoney(accountEquity)}
              </p>

              <p className="mt-3 text-xs leading-5 text-green-100/80 sm:text-sm">
                Available cash + current portfolio value
              </p>
            </div>

            <Link
              href="/stocks"
              className="inline-flex w-full items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600 sm:w-fit"
            >
              Trade Markets →
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
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

        {/* Holdings + Allocation */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 lg:grid-cols-3 lg:gap-6">
          {/* Holdings */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
            {/* Holdings Header */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h3 className="font-bold text-[#14532D]">
                  Your Holdings
                </h3>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Current portfolio positions
                </p>
              </div>

              <Link
                href="/portfolio"
                className="shrink-0 text-xs font-semibold text-orange-500 transition hover:text-orange-600 sm:text-sm"
              >
                View all →
              </Link>
            </div>

            {holdings.length === 0 ? (
              <div className="px-4 py-12 text-center sm:px-6 sm:py-14">
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
              <>
                {/* Mobile Holdings */}
                <div className="divide-y divide-gray-100 sm:hidden">
                  {holdings.slice(0, 5).map((holding) => (
                    <div
                      key={holding.stock_id}
                      className="p-4 transition hover:bg-green-50/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-[#14532D]">
                            {holding.symbol}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-500">
                            {holding.name}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-gray-900">
                          {formatMoney(holding.market_value)}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-[#F7FAF7] p-3">
                          <p className="text-xs text-gray-500">
                            Quantity
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {holding.quantity}
                          </p>
                        </div>

                        <div className="rounded-lg bg-[#F7FAF7] p-3">
                          <p className="text-xs text-gray-500">
                            Current Price
                          </p>

                          <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                            {formatMoney(holding.current_price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet / Desktop Table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="min-w-[650px] w-full text-left">
                    <thead className="bg-[#F7FAF7] text-xs uppercase text-gray-500">
                      <tr>
                        <th className="whitespace-nowrap px-5 py-4 font-semibold lg:px-6">
                          Asset
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 font-semibold lg:px-6">
                          Quantity
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 font-semibold lg:px-6">
                          Price
                        </th>

                        <th className="whitespace-nowrap px-5 py-4 text-right font-semibold lg:px-6">
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
                          <td className="px-5 py-4 lg:px-6">
                            <p className="font-bold text-[#14532D]">
                              {holding.symbol}
                            </p>

                            <p className="mt-1 max-w-[180px] truncate text-xs text-gray-500">
                              {holding.name}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-gray-600 lg:px-6">
                            {holding.quantity}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-gray-600 lg:px-6">
                            {formatMoney(holding.current_price)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-gray-900 lg:px-6">
                            {formatMoney(holding.market_value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Allocation */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-1">
            <div className="mb-1 h-1 w-10 rounded-full bg-orange-500" />

            <h3 className="mt-4 font-bold text-[#14532D]">
              Portfolio Allocation
            </h3>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Distribution by market value
            </p>

            <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
              {holdings.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 sm:py-10">
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
                        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                          <span className="truncate font-semibold text-gray-700">
                            {holding.symbol}
                          </span>

                          <span className="shrink-0 font-semibold text-gray-500">
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
                              width: `${Math.min(
                                percentage,
                                100
                              )}%`,
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

            <h3 className="text-base font-bold text-[#14532D] sm:text-lg">
              Quick Actions
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6">
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

      <p className="mt-2 break-all text-xl font-bold text-gray-900 sm:text-2xl">
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
      className={`group min-w-0 rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5 ${
        isGreen
          ? "border-green-100 hover:border-green-300"
          : "border-orange-100 hover:border-orange-300"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`min-w-0 font-bold ${
            isGreen
              ? "text-[#14532D]"
              : "text-orange-600"
          }`}
        >
          {title}
        </p>

        <span
          className={`shrink-0 transition group-hover:translate-x-1 ${
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