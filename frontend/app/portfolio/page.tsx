"use client";

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

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">
          My Portfolio
        </h1>

        <p className="text-gray-400 mb-8">
          Track your current stock holdings.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">
              Portfolio Value
            </p>

            <p className="text-3xl font-bold mt-2">
              ${totalValue.toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">
              Stocks Owned
            </p>

            <p className="text-3xl font-bold mt-2">
              {totalStocks}
            </p>
          </div>

        </div>

        {/* Loading */}
        {loading && (
          <p className="text-gray-400">
            Loading portfolio...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-red-400">
            {error}
          </p>
        )}

        {/* Empty Portfolio */}
        {!loading && !error && holdings.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
            <h2 className="text-xl font-semibold mb-2">
              No stocks yet
            </h2>

            <p className="text-gray-400">
              Buy your first stock to start building your portfolio.
            </p>
          </div>
        )}

        {/* Holdings Table */}
        {!loading && !error && holdings.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold">
                Holdings
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-gray-400">
                      Stock
                    </th>

                    <th className="text-right px-6 py-4 text-gray-400">
                      Quantity
                    </th>

                    <th className="text-right px-6 py-4 text-gray-400">
                      Current Price
                    </th>

                    <th className="text-right px-6 py-4 text-gray-400">
                      Market Value
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {holdings.map((holding) => (
                    <tr
                      key={holding.stock_id}
                      className="border-t border-gray-800 hover:bg-gray-800/40"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold">
                          {holding.symbol}
                        </div>

                        <div className="text-sm text-gray-400">
                          {holding.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {holding.quantity}
                      </td>

                      <td className="px-6 py-4 text-right">
                        ${holding.current_price.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold">
                        ${holding.market_value.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}