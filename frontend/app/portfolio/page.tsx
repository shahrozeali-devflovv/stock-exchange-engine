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
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 px-6 py-5 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Portfolio
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              My Portfolio
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track your assets and current market value.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {/* Main portfolio value */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-7">
          <p className="text-sm font-medium text-slate-400">
            Total Portfolio Value
          </p>

          <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            {formatMoney(totalValue)}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/stocks"
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              Trade Markets →
            </Link>

            <Link
              href="/transactions"
              className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Transaction History
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Portfolio Value"
            value={formatMoney(totalValue)}
            description="Current market value"
          />

          <SummaryCard
            label="Units Owned"
            value={totalStocks.toLocaleString()}
            description="Across all assets"
          />

          <SummaryCard
            label="Assets"
            value={holdings.length.toString()}
            description="Different positions"
          />

          <SummaryCard
            label="Largest Position"
            value={largestHolding?.symbol || "None"}
            description={
              largestHolding
                ? formatMoney(largestHolding.market_value)
                : "No holdings yet"
            }
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />

              <p className="mt-4 text-sm text-slate-500">
                Loading your portfolio...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="font-semibold text-red-400">
              Could not load portfolio
            </p>

            <p className="mt-1 text-sm text-red-400/70">
              {error}
            </p>
          </div>
        )}

        {/* Empty Portfolio */}
        {!loading && !error && holdings.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-2xl font-bold text-blue-400">
              $
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Your portfolio is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don't currently own any assets. Visit the live
              market and make your first trade to start building
              your portfolio.
            </p>

            <Link
              href="/stocks"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              Browse Markets
            </Link>
          </div>
        )}

        {!loading && !error && holdings.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Holdings Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                <div>
                  <h2 className="font-semibold">
                    Holdings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your current market positions
                  </p>
                </div>

                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  {holdings.length} assets
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Asset
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Quantity
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Price
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                          className="border-b border-slate-800/70 transition last:border-0 hover:bg-slate-800/30"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">
                                {shortSymbol}
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {holding.symbol}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {holding.name}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-right text-slate-300">
                            {holding.quantity.toLocaleString()}
                          </td>

                          <td className="px-6 py-5 text-right text-slate-300">
                            {formatMoney(holding.current_price)}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <p className="font-semibold">
                              {formatMoney(holding.market_value)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
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

            {/* Allocation Visual */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div>
                <h2 className="font-semibold">
                  Allocation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Portfolio distribution
                </p>
              </div>

              <div className="mt-7 space-y-6">
                {holdings
                  .slice()
                  .sort(
                    (a, b) =>
                      b.market_value - a.market_value
                  )
                  .map((holding) => {
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
                            <p className="text-sm font-semibold">
                              {shortSymbol}
                            </p>

                            <p className="text-xs text-slate-500">
                              {formatMoney(holding.market_value)}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-slate-300">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-8 border-t border-slate-800 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Total
                  </span>

                  <span className="font-semibold">
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
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>
    </div>
  );
}