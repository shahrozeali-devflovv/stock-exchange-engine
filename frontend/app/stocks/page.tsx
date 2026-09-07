"use client";

import { useEffect, useMemo, useState } from "react";
import { getStocks, syncStock } from "@/services/stockService";
import { buyStock, sellStock } from "@/services/tradeService";

type Stock = {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
};

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL" | null>(null);
  const [quantity, setQuantity] = useState("");
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState("");

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const data = await getStocks();
        setStocks(data);
      } catch (error) {
        console.error("Failed to load stocks:", error);
        setError("Unable to load stocks.");
      } finally {
        setLoading(false);
      }
    };

    loadStocks();
  }, []);

  const handleSyncStock = async () => {
    try {
      setSyncLoading(true);
      setSyncMessage("");
      setError("");

      const syncedStock = await syncStock("AAPL", "Apple Inc.");

      setStocks((currentStocks) => {
        const exists = currentStocks.some(
          (stock) => stock.id === syncedStock.id
        );

        if (exists) {
          return currentStocks.map((stock) =>
            stock.id === syncedStock.id ? syncedStock : stock
          );
        }

        return [...currentStocks, syncedStock];
      });

      setSyncMessage(
        `${syncedStock.symbol} synced successfully.`
      );
    } catch (error: any) {
      console.error("Failed to sync stock:", error);

      const message =
        error?.response?.data?.detail ||
        "Failed to sync stock.";

      setSyncMessage(message);
    } finally {
      setSyncLoading(false);
    }
  };

  const filteredStocks = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return stocks;
    }

    return stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
    );
  }, [stocks, search]);

  const openTradeModal = (
    stock: Stock,
    type: "BUY" | "SELL"
  ) => {
    setSelectedStock(stock);
    setTradeType(type);
    setQuantity("");
    setTradeMessage("");
  };

  const closeTradeModal = () => {
    if (tradeLoading) {
      return;
    }

    setSelectedStock(null);
    setTradeType(null);
    setQuantity("");
    setTradeMessage("");
  };

  const handleTrade = async () => {
    if (!selectedStock || !tradeType) {
      return;
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setTradeMessage("Please enter a valid quantity.");
      return;
    }

    try {
      setTradeLoading(true);
      setTradeMessage("");

      let response;

      if (tradeType === "BUY") {
        response = await buyStock(
          selectedStock.id,
          parsedQuantity
        );
      } else {
        response = await sellStock(
          selectedStock.id,
          parsedQuantity
        );
      }

      setTradeMessage(
        response.message ||
          "Trade completed successfully."
      );

      setQuantity("");
    } catch (error: any) {
      console.error("Trade failed:", error);

      const message =
        error?.response?.data?.detail ||
        "Trade failed. Please try again.";

      setTradeMessage(message);
    } finally {
      setTradeLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-5 backdrop-blur md:px-10">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-sm font-medium text-blue-400">
              MARKET
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Stocks
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Explore available stocks and find your next
              investment.
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {/* Top section */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Available Stocks
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {stocks.length} stocks available
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search stocks..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            {/* Sync button */}
            <button
              onClick={handleSyncStock}
              disabled={syncLoading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {syncLoading
                ? "Syncing..."
                : "↻ Sync Stock"}
            </button>
          </div>
        </div>

        {/* Sync message */}
        {syncMessage && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
            {syncMessage}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-slate-400">
              Loading stocks...
            </p>
          </div>
        ) : filteredStocks.length === 0 ? (
          /* Empty state */
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
              🔎
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              No stocks found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try searching with a different stock symbol
              or name.
            </p>
          </div>
        ) : (
          /* Stock table */
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="border-b border-slate-800 bg-slate-900/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Symbol
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredStocks.map((stock) => (
                    <tr
                      key={stock.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      {/* Stock name */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-white">
                            {stock.symbol.slice(0, 1)}
                          </div>

                          <div>
                            <p className="font-semibold text-white">
                              {stock.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              US Equity
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Symbol */}
                      <td className="px-6 py-5">
                        <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-300">
                          {stock.symbol}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-5 text-right">
                        <p className="text-base font-semibold text-white">
                          $
                          {stock.current_price.toLocaleString()}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 text-right">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Market Open
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openTradeModal(
                                stock,
                                "BUY"
                              )
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-95"
                          >
                            Buy
                          </button>

                          <button
                            onClick={() =>
                              openTradeModal(
                                stock,
                                "SELL"
                              )
                            }
                            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-95"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Trade Modal */}
      {selectedStock && tradeType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {tradeType === "BUY"
                    ? "Buy Stock"
                    : "Sell Stock"}
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {selectedStock.symbol}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {selectedStock.name}
                </p>
              </div>

              <button
                onClick={closeTradeModal}
                className="text-xl text-slate-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-slate-800/60 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">
                  Current Price
                </span>

                <span className="font-semibold">
                  $
                  {selectedStock.current_price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Enter quantity"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            {quantity &&
              Number(quantity) > 0 && (
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-slate-400">
                    Estimated value
                  </span>

                  <span className="font-semibold">
                    $
                    {(
                      selectedStock.current_price *
                      Number(quantity)
                    ).toLocaleString()}
                  </span>
                </div>
              )}

            {tradeMessage && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300">
                {tradeMessage}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeTradeModal}
                disabled={tradeLoading}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleTrade}
                disabled={tradeLoading}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {tradeLoading
                  ? "Processing..."
                  : tradeType === "BUY"
                    ? "Confirm Buy"
                    : "Confirm Sell"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}