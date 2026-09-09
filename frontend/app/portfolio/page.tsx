"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPortfolio } from "@/services/portfolioService";

type Holding = {
  stock_id: number;
  symbol: string;
  name: string;
  quantity: number;
  current_price: number;
  market_value: number;
};

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const data = await getPortfolio();
        setHoldings(data);
      } catch (err) {
        console.error("Portfolio error:", err);
        setError("Failed to load portfolio.");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const totalValue = holdings.reduce(
    (total, holding) => total + holding.market_value,
    0
  );

  const totalStocks = holdings.reduce(
    (total, holding) => total + holding.quantity,
    0
  );

  const largestHolding =
    holdings.length > 0
      ? holdings.reduce((largest, holding) =>
          holding.market_value > largest.market_value
            ? holding
            : largest
        )
      : null;

  const formatMoney = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7FAF7] text-gray-900">
      {/* Header */}
      <header className="bg-[#14532D] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-400 sm:text-sm">
              Portfolio
            </p>

            <h1 className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              My Portfolio
            </h1>

            <p className="mt-1 hidden text-sm text-green-100 sm:block">
              Track your assets and current market value.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="shrink-0 rounded-lg border border-white/30 px-3 py-2 text-xs font-medium text-white transition hover:bg-white hover:text-[#14532D] sm:px-4 sm:text-sm"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Main Portfolio Card */}
        <div className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#14532D] to-[#15803D] p-5 text-white shadow-lg sm:mb-6 sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-400/20 sm:-right-12 sm:-top-12 sm:h-40 sm:w-40" />

          <div className="pointer-events-none absolute -bottom-16 right-8 h-28 w-28 rounded-full bg-white/5 sm:right-32 sm:h-32 sm:w-32" />

          <div className="relative">
            <p className="text-xs font-medium text-green-100 sm:text-sm">
              Total Portfolio Value
            </p>

            <p className="mt-2 break-all text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {formatMoney(totalValue)}
            </p>

            <p className="mt-3 text-xs leading-5 text-green-100/80 sm:text-sm">
              Current market value of all your positions
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap">
              <Link
                href="/stocks"
                className="inline-flex w-full items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 sm:w-fit"
              >
                Trade Markets →
              </Link>

              <Link
                href="/transactions"
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#14532D] sm:w-fit"
              >
                Transaction History
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-8 lg:grid-cols-4">
          <SummaryCard
            label="Portfolio Value"
            value={formatMoney(totalValue)}
            description="Current market value"
            accent="green"
          />

          <SummaryCard
            label="Units Owned"
            value={totalStocks.toLocaleString()}
            description="Across all assets"
            accent="orange"
          />

          <SummaryCard
            label="Assets"
            value={holdings.length.toString()}
            description="Different positions"
            accent="green"
          />

          <SummaryCard
            label="Largest Position"
            value={largestHolding?.symbol || "None"}
            description={
              largestHolding
                ? formatMoney(largestHolding.market_value)
                : "No holdings yet"
            }
            accent="orange"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 shadow-sm sm:min-h-[300px]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

              <p className="mt-4 text-sm text-gray-500">
                Loading your portfolio...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-6">
            <p className="font-semibold text-red-600">
              Could not load portfolio
            </p>

            <p className="mt-1 text-sm text-red-500">
              {error}
            </p>
          </div>
        )}

        {/* Empty Portfolio */}
        {!loading && !error && holdings.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center shadow-sm sm:px-6 sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl font-bold text-green-700 sm:h-16 sm:w-16">
              $
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#14532D] sm:text-xl">
              Your portfolio is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You don&apos;t currently own any assets. Visit the live
              market and make your first trade to start building your
              portfolio.
            </p>

            <Link
              href="/stocks"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 sm:w-fit"
            >
              Browse Markets
            </Link>
          </div>
        )}

        {/* Portfolio Content */}
        {!loading && !error && holdings.length > 0 && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
            {/* Holdings */}
            <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <div className="mb-2 h-1 w-10 rounded-full bg-orange-500" />

                  <h2 className="font-bold text-[#14532D]">
                    Holdings
                  </h2>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    Your current market positions
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  {holdings.length} assets
                </span>
              </div>

              {/* Mobile Holdings Cards */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {holdings.map((holding) => {
                  const percentage =
                    totalValue > 0
                      ? (holding.market_value / totalValue) * 100
                      : 0;

                  const shortSymbol = holding.symbol
                    .replace("BINANCE:", "")
                    .replace("USDT", "");

                  return (
                    <div
                      key={holding.stock_id}
                      className="p-4 transition hover:bg-green-50/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-[10px] font-bold text-green-700">
                          {shortSymbol}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#14532D]">
                                {holding.symbol}
                              </p>

                              <p className="mt-1 truncate text-xs text-gray-500">
                                {holding.name}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold text-gray-900">
                                {formatMoney(holding.market_value)}
                              </p>

                              <p className="mt-1 text-xs font-medium text-orange-500">
                                {percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-[#F7FAF7] p-3">
                              <p className="text-xs text-gray-500">
                                Quantity
                              </p>

                              <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                                {holding.quantity.toLocaleString()}
                              </p>
                            </div>

                            <div className="rounded-lg bg-[#F7FAF7] p-3">
                              <p className="text-xs text-gray-500">
                                Price
                              </p>

                              <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                                {formatMoney(holding.current_price)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-green-600"
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tablet / Desktop Table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-[#F7FAF7]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500 lg:px-6">
                        Asset
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500 lg:px-6">
                        Quantity
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500 lg:px-6">
                        Price
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500 lg:px-6">
                        Value
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {holdings.map((holding) => {
                      const percentage =
                        totalValue > 0
                          ? (holding.market_value / totalValue) * 100
                          : 0;

                      const shortSymbol = holding.symbol
                        .replace("BINANCE:", "")
                        .replace("USDT", "");

                      return (
                        <tr
                          key={holding.stock_id}
                          className="border-t border-gray-100 transition hover:bg-green-50/50"
                        >
                          <td className="px-5 py-5 lg:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700">
                                {shortSymbol}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[180px] truncate font-bold text-[#14532D]">
                                  {holding.symbol}
                                </p>

                                <p className="mt-1 max-w-[180px] truncate text-xs text-gray-500">
                                  {holding.name}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-right text-gray-600 lg:px-6">
                            {holding.quantity.toLocaleString()}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-right text-gray-600 lg:px-6">
                            {formatMoney(holding.current_price)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-right lg:px-6">
                            <p className="font-bold text-gray-900">
                              {formatMoney(holding.market_value)}
                            </p>

                            <p className="mt-1 text-xs font-medium text-orange-500">
                              {percentage.toFixed(1)}% of portfolio
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Allocation */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="h-1 w-10 rounded-full bg-orange-500" />

              <h2 className="mt-4 font-bold text-[#14532D]">
                Allocation
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Portfolio distribution
              </p>

              <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
                {holdings
                  .slice()
                  .sort(
                    (a, b) =>
                      b.market_value - a.market_value
                  )
                  .map((holding, index) => {
                    const percentage =
                      totalValue > 0
                        ? (holding.market_value / totalValue) * 100
                        : 0;

                    const shortSymbol = holding.symbol
                      .replace("BINANCE:", "")
                      .replace("USDT", "");

                    return (
                      <div key={holding.stock_id}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-700">
                              {shortSymbol}
                            </p>

                            <p className="mt-1 break-all text-xs text-gray-500">
                              {formatMoney(holding.market_value)}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-bold text-gray-700">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              index % 2 === 0
                                ? "bg-green-600"
                                : "bg-orange-500"
                            }`}
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Total
                  </span>

                  <span className="break-all text-right font-bold text-[#14532D]">
                    {formatMoney(totalValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
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
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          isGreen ? "bg-green-600" : "bg-orange-500"
        }`}
      />

      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-all text-xl font-bold text-gray-900 sm:text-2xl">
        {value}
      </p>

      <p
        className={`mt-1 text-xs font-medium ${
          isGreen ? "text-green-600" : "text-orange-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}