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
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 px-6 py-5 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              Stock Exchange Engine
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Trading dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            OVERVIEW
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome back{username ? `, ${username}` : ""}
          </h2>

          <p className="mt-2 text-slate-400">
            Track your balance, investments and current holdings.
          </p>
        </div>

        {/* Main account card */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-7">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Total Account Equity
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
                {formatMoney(accountEquity)}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Available cash + current portfolio value
              </p>
            </div>

            <Link
              href="/stocks"
              className="inline-flex w-fit items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              Trade Markets →
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-5 md:grid-cols-3">
          <SummaryCard
            label="Available Balance"
            value={formatMoney(balance)}
            description="Ready to trade"
          />

          <SummaryCard
            label="Portfolio Value"
            value={formatMoney(portfolioValue)}
            description="Current market value"
          />

          <SummaryCard
            label="Assets Owned"
            value={stocksOwned.toLocaleString()}
            description={`${holdings.length} different assets`}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Holdings */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h3 className="font-semibold">Your Holdings</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Current portfolio positions
                </p>
              </div>

              <Link
                href="/portfolio"
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                View all →
              </Link>
            </div>

            {holdings.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-xl">
                  $
                </div>

                <p className="mt-4 font-medium">
                  No assets yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Start trading to build your portfolio.
                </p>

                <Link
                  href="/stocks"
                  className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
                >
                  Browse Markets
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr className="border-b border-slate-800">
                      <th className="px-6 py-4 font-medium">
                        Asset
                      </th>
                      <th className="px-6 py-4 font-medium">
                        Quantity
                      </th>
                      <th className="px-6 py-4 font-medium">
                        Price
                      </th>
                      <th className="px-6 py-4 text-right font-medium">
                        Value
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {holdings.slice(0, 5).map((holding) => (
                      <tr
                        key={holding.stock_id}
                        className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold">
                            {holding.symbol}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {holding.name}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {holding.quantity}
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {formatMoney(holding.current_price)}
                        </td>

                        <td className="px-6 py-4 text-right font-semibold">
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="font-semibold">
              Portfolio Allocation
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Distribution by market value
            </p>

            <div className="mt-7 space-y-6">
              {holdings.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
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
                  .map((holding) => {
                    const percentage =
                      portfolioValue > 0
                        ? (holding.market_value /
                            portfolioValue) *
                          100
                        : 0;

                    return (
                      <div key={holding.stock_id}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {holding.symbol}
                          </span>

                          <span className="text-slate-400">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-blue-500"
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

        {/* Quick actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold">
            Quick Actions
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <QuickAction
              href="/stocks"
              title="Browse Markets"
              description="View live prices and trade assets."
            />

            <QuickAction
              href="/portfolio"
              title="Portfolio"
              description="Review all your current holdings."
            />

            <QuickAction
              href="/transactions"
              title="Transactions"
              description="View your complete trading history."
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
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-slate-700">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-blue-500/40 hover:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {title}
        </p>

        <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-400">
          →
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Link>
  );
}