"use client";

import { useEffect, useState } from "react";
import { getWallet } from "@/services/walletService";
import { getCurrentUser } from "@/services/userService";
import { getPortfolio } from "@/services/portfolioService";

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [stocksOwned, setStocksOwned] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load wallet balance
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const data = await getWallet();
        setBalance(data.balance);
      } catch (error) {
        console.error("Failed to load wallet:", error);
      }
    };

    loadWallet();
  }, []);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        setUsername(data.username);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, []);

  // Load portfolio summary
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const holdings = await getPortfolio();

        const totalValue = holdings.reduce(
          (total: number, holding: any) =>
            total + holding.market_value,
          0
        );

        const totalStocks = holdings.reduce(
          (total: number, holding: any) =>
            total + holding.quantity,
          0
        );

        setPortfolioValue(totalValue);
        setStocksOwned(totalStocks);
      } catch (error) {
        console.error(
          "Failed to load portfolio:",
          error
        );
      }
    };

    loadPortfolio();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-8 py-5">
        <h1 className="text-2xl font-bold">
          Stock Exchange Engine
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Your trading dashboard
        </p>
      </header>

      {/* Dashboard Content */}
      <section className="p-8">
        <h2 className="text-2xl font-semibold">
          Welcome back{username ? `, ${username}` : ""} 👋
        </h2>

        <p className="mt-2 text-slate-400">
          Here's an overview of your trading account.
        </p>

        {/* Summary Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Portfolio Value */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Portfolio Value
            </p>

            <p className="mt-3 text-3xl font-bold">
              ${portfolioValue.toFixed(2)}
            </p>
          </div>

          {/* Available Balance */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Available Balance
            </p>

            <p className="mt-3 text-3xl font-bold">
              ${balance.toLocaleString()}
            </p>
          </div>

          {/* Stocks Owned */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Stocks Owned
            </p>

            <p className="mt-3 text-3xl font-bold">
              {stocksOwned}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold">
            Quick Actions
          </h3>

          <div className="mt-4 flex gap-4 flex-wrap">
            <a
              href="/stocks"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
            >
              Browse Stocks
            </a>

            <a
              href="/portfolio"
              className="rounded-lg border border-slate-700 px-5 py-3 font-medium transition hover:bg-slate-900"
            >
              View Portfolio
            </a>

            <a
              href="/transactions"
              className="rounded-lg border border-slate-700 px-5 py-3 font-medium transition hover:bg-slate-900"
            >
              View Transactions
            </a>
            <button
  onClick={() => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }}
  className="rounded-lg bg-red-600 px-5 py-3 font-medium transition hover:bg-red-500"
>
  Logout
</button>
          </div>
        </div>
      </section>
    </main>
  );
}