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
    <main className="min-h-screen bg-[#F7FAF7] text-gray-900">
      {/* Header */}
      <header className="bg-[#14532D] px-6 py-5 text-white shadow-md md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-400">
              Portfolio
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              My Portfolio
            </h1>

            <p className="mt-1 text-sm text-green-100">
              Track your assets and current market value.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-[#14532D]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {/* Main Portfolio Card */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#14532D] to-[#15803D] p-7 text-white shadow-lg">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-400/20" />
          <div className="absolute -bottom-16 right-32 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative">
            <p className="text-sm font-medium text-green-100">
              Total Portfolio Value
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
              {formatMoney(totalValue)}
            </p>

            <p className="mt-3 text-sm text-green-100/80">
              Current market value of all your positions
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/stocks"
                className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
              >
                Trade Markets →
              </Link>

              <Link
                href="/transactions"
                className="rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#14532D]"
              >
                Transaction History
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
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
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl font-bold text-green-700">
              $
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#14532D]">
              Your portfolio is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You don't currently own any assets. Visit the live
              market and make your first trade to start building
              your portfolio.
            </p>

            <Link
              href="/stocks"
              className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Browse Markets
            </Link>
          </div>
        )}

        {/* Portfolio Content */}
        {!loading && !error && holdings.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Holdings */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <div className="mb-2 h-1 w-10 rounded-full bg-orange-500" />

                  <h2 className="font-bold text-[#14532D]">
                    Holdings
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your current market positions
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  {holdings.length} assets
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-[#F7FAF7]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Asset
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                        Quantity
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                        Price
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
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
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700">
                                {shortSymbol}
                              </div>

                              <div>
                                <p className="font-bold text-[#14532D]">
                                  {holding.symbol}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {holding.name}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-right text-gray-600">
                            {holding.quantity.toLocaleString()}
                          </td>

                          <td className="px-6 py-5 text-right text-gray-600">
                            {formatMoney(holding.current_price)}
                          </td>

                          <td className="px-6 py-5 text-right">
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
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-1 w-10 rounded-full bg-orange-500" />

              <h2 className="mt-4 font-bold text-[#14532D]">
                Allocation
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Portfolio distribution
              </p>

              <div className="mt-7 space-y-6">
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
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-700">
                              {shortSymbol}
                            </p>

                            <p className="text-xs text-gray-500">
                              {formatMoney(holding.market_value)}
                            </p>
                          </div>

                          <p className="text-sm font-bold text-gray-700">
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
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Total
                  </span>

                  <span className="font-bold text-[#14532D]">
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
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          isGreen ? "bg-green-600" : "bg-orange-500"
        }`}
      />

      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
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