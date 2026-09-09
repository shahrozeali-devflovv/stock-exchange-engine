"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTransactions } from "@/services/transactionService";

type Transaction = {
  id: number;
  stock_id: number;
  symbol?: string;
  transaction_type: string;
  quantity: number;
  price: number;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to load transactions:", error);
        setError("Failed to load transaction history.");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const totalTransactions = transactions.length;

  const totalBuys = transactions.filter(
    (tx) => tx.transaction_type.toUpperCase() === "BUY"
  ).length;

  const totalSells = transactions.filter(
    (tx) => tx.transaction_type.toUpperCase() === "SELL"
  ).length;

  const totalTradedValue = transactions.reduce(
    (total, tx) => total + tx.quantity * tx.price,
    0
  );

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
              Activity
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Transaction History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review your completed buy and sell orders.
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
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Transactions"
            value={totalTransactions.toString()}
            description="Total recorded trades"
          />

          <SummaryCard
            label="Buy Orders"
            value={totalBuys.toString()}
            description="Completed purchases"
          />

          <SummaryCard
            label="Sell Orders"
            value={totalSells.toString()}
            description="Completed sales"
          />

          <SummaryCard
            label="Trading Volume"
            value={formatMoney(totalTradedValue)}
            description="Value of loaded transactions"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />

              <p className="mt-4 text-sm text-slate-500">
                Loading transaction history...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="font-semibold text-red-400">
              Could not load transactions
            </p>

            <p className="mt-1 text-sm text-red-400/70">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && transactions.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-2xl font-bold text-blue-400">
              ↕
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No transactions yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your completed buy and sell orders will appear here.
              Visit the live market to make your first trade.
            </p>

            <Link
              href="/stocks"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              Browse Markets
            </Link>
          </div>
        )}

        {/* Transaction Table */}
        {!loading && !error && transactions.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="flex flex-col gap-3 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest trading transactions
                </p>
              </div>

              <Link
                href="/stocks"
                className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500"
              >
                New Trade
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Transaction
                    </th>

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
                      Total Value
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((tx) => {
                    const isBuy =
                      tx.transaction_type.toUpperCase() === "BUY";

                    const transactionValue =
                      tx.quantity * tx.price;

                    const shortSymbol = tx.symbol
                      ? tx.symbol
                          .replace("BINANCE:", "")
                          .replace("USDT", "")
                      : `#${tx.stock_id}`;

                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-slate-800/70 transition last:border-0 hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                isBuy
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {isBuy ? "↓" : "↑"}
                            </div>

                            <div>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                  isBuy
                                    ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                                }`}
                              >
                                {tx.transaction_type.toUpperCase()}
                              </span>

                              <p className="mt-1 text-xs text-slate-600">
                                Transaction #{tx.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold">
                            {shortSymbol}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Stock ID: {tx.stock_id}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-right text-slate-300">
                          {tx.quantity.toLocaleString()}
                        </td>

                        <td className="px-6 py-5 text-right text-slate-300">
                          {formatMoney(tx.price)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <p className="font-semibold">
                            {formatMoney(transactionValue)}
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              isBuy
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {isBuy ? "Purchase" : "Sale"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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