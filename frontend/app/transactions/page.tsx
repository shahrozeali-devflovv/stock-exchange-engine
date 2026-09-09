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
    <main className="min-h-screen bg-[#F7FAF7] text-gray-900">
      {/* Page Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-5 shadow-sm md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
              Activity
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#14532D] md:text-3xl">
              Transaction History
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review your completed buy and sell orders.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="w-fit rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
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
            accent="green"
          />

          <SummaryCard
            label="Buy Orders"
            value={totalBuys.toString()}
            description="Completed purchases"
            accent="green"
          />

          <SummaryCard
            label="Sell Orders"
            value={totalSells.toString()}
            description="Completed sales"
            accent="orange"
          />

          <SummaryCard
            label="Trading Volume"
            value={formatMoney(totalTradedValue)}
            description="Value of loaded transactions"
            accent="orange"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

              <p className="mt-4 text-sm text-gray-500">
                Loading transaction history...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-600">
              Could not load transactions
            </p>

            <p className="mt-1 text-sm text-red-500">
              {error}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-2xl font-bold text-orange-500">
              ↕
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#14532D]">
              No transactions yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Your completed buy and sell orders will appear here.
              Visit the live market to make your first trade.
            </p>

            <Link
              href="/stocks"
              className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Browse Markets
            </Link>
          </div>
        )}

        {/* Transaction Table */}
        {!loading && !error && transactions.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 h-1 w-10 rounded-full bg-orange-500" />

                <h2 className="font-bold text-[#14532D]">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your latest trading transactions
                </p>
              </div>

              <Link
                href="/stocks"
                className="w-fit rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
              >
                New Trade
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#F7FAF7]">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Transaction
                    </th>

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
                        className="border-b border-gray-100 transition last:border-0 hover:bg-green-50/50"
                      >
                        {/* Transaction Type */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${
                                isBuy
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {isBuy ? "↓" : "↑"}
                            </div>

                            <div>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                  isBuy
                                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                    : "bg-red-50 text-red-600 ring-1 ring-red-200"
                                }`}
                              >
                                {tx.transaction_type.toUpperCase()}
                              </span>

                              <p className="mt-1 text-xs text-gray-400">
                                Transaction #{tx.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Asset */}
                        <td className="px-6 py-5">
                          <p className="font-bold text-[#14532D]">
                            {shortSymbol}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Stock ID: {tx.stock_id}
                          </p>
                        </td>

                        {/* Quantity */}
                        <td className="px-6 py-5 text-right text-gray-600">
                          {tx.quantity.toLocaleString()}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-5 text-right text-gray-600">
                          {formatMoney(tx.price)}
                        </td>

                        {/* Total */}
                        <td className="px-6 py-5 text-right">
                          <p className="font-bold text-gray-900">
                            {formatMoney(transactionValue)}
                          </p>

                          <p
                            className={`mt-1 text-xs font-semibold ${
                              isBuy
                                ? "text-green-600"
                                : "text-red-600"
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

      <p className="mt-2 text-2xl font-bold text-[#14532D]">
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