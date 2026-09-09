"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  buyStock,
  sellStock,
} from "@/services/tradeService";

type Trade = {
  t: number;
  p: number;
  v: number;
  s: string;
  stock_id: number;
};

export default function StocksPage() {
  const [trades, setTrades] = useState<Trade[]>([]);

  const [minVolumeInput, setMinVolumeInput] =
    useState("0");

  const [appliedMinVolume, setAppliedMinVolume] =
    useState("0");

  const [isConnected, setIsConnected] =
    useState(false);

  const [isConnecting, setIsConnecting] =
    useState(true);

  const [filterError, setFilterError] =
    useState("");

  const [selectedTrade, setSelectedTrade] =
    useState<Trade | null>(null);

  const [tradeAction, setTradeAction] =
    useState<"BUY" | "SELL" | null>(null);

  const [quantity, setQuantity] =
    useState("");

  const [tradeLoading, setTradeLoading] =
    useState(false);

  const [tradeMessage, setTradeMessage] =
    useState("");

  const [tradeError, setTradeError] =
    useState("");

  const socketRef =
    useRef<WebSocket | null>(null);

  useEffect(() => {
    setIsConnecting(true);
    setIsConnected(false);

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/market?min_volume=${appliedMinVolume}`
    );

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");

      setIsConnected(true);
      setIsConnecting(false);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(
          event.data
        );

        if (
          message.type === "trade" &&
          Array.isArray(message.data)
        ) {
          setTrades((currentTrades) => {
            const updatedTrades = [
              ...currentTrades,
            ];

            message.data.forEach(
              (newTrade: Trade) => {
                const existingIndex =
                  updatedTrades.findIndex(
                    (trade) =>
                      trade.s === newTrade.s
                  );

                if (existingIndex >= 0) {
                  updatedTrades[
                    existingIndex
                  ] = newTrade;
                } else {
                  updatedTrades.push(
                    newTrade
                  );
                }
              }
            );

            return updatedTrades;
          });
        }
      } catch (error) {
        console.error(
          "Could not parse WebSocket message:",
          error
        );
      }
    };

    ws.onerror = () => {
      setIsConnecting(false);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log(
        "WebSocket disconnected"
      );

      setIsConnected(false);
      setIsConnecting(false);
    };

    return () => {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;

      if (
        ws.readyState ===
          WebSocket.OPEN ||
        ws.readyState ===
          WebSocket.CONNECTING
      ) {
        ws.close();
      }

      if (
        socketRef.current === ws
      ) {
        socketRef.current = null;
      }
    };
  }, [appliedMinVolume]);

  const handleApplyFilter = () => {
    const value =
      Number(minVolumeInput);

    if (
      minVolumeInput.trim() === "" ||
      Number.isNaN(value) ||
      value < 0
    ) {
      setFilterError(
        "Minimum volume must be 0 or greater."
      );

      return;
    }

    setFilterError("");

    const nextVolume =
      String(value);

    if (
      nextVolume ===
      appliedMinVolume
    ) {
      return;
    }

    setTrades([]);

    setAppliedMinVolume(
      nextVolume
    );
  };

  const formatTime = (
    timestamp: number
  ) => {
    return new Date(
      timestamp
    ).toLocaleTimeString();
  };

  const formatPrice = (
    price: number
  ) =>
    price.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  const openTradeModal = (
    trade: Trade,
    action: "BUY" | "SELL"
  ) => {
    setSelectedTrade(trade);

    setTradeAction(action);

    setQuantity("");

    setTradeMessage("");

    setTradeError("");
  };

  const closeTradeModal = () => {
    setSelectedTrade(null);

    setTradeAction(null);

    setQuantity("");

    setTradeMessage("");

    setTradeError("");
  };

  const handleTrade = async () => {
    if (
      !selectedTrade ||
      !tradeAction
    ) {
      return;
    }

    const parsedQuantity =
      Number(quantity);

    if (
      Number.isNaN(parsedQuantity) ||
      parsedQuantity <= 0 ||
      !Number.isInteger(
        parsedQuantity
      )
    ) {
      setTradeError(
        "Quantity must be a positive whole number."
      );

      return;
    }

    try {
      setTradeLoading(true);

      setTradeError("");

      setTradeMessage("");

      let response;

      if (
        tradeAction === "BUY"
      ) {
        response =
          await buyStock(
            selectedTrade.stock_id,
            parsedQuantity
          );
      } else {
        response =
          await sellStock(
            selectedTrade.stock_id,
            parsedQuantity
          );
      }

      setTradeMessage(
        response.message ||
          `${tradeAction} completed successfully.`
      );

      setQuantity("");
    } catch (error: any) {
      console.error(
        "Trade failed:",
        error
      );

      setTradeError(
        error?.response?.data?.detail ||
          "Trade failed. Please try again."
      );
    } finally {
      setTradeLoading(false);
    }
  };

  const totalMarketValue =
    trades.reduce(
      (total, trade) =>
        total + trade.p * trade.v,
      0
    );

  const averagePrice =
    trades.length > 0
      ? trades.reduce(
          (total, trade) =>
            total + trade.p,
          0
        ) / trades.length
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 px-6 py-5 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Markets
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Live Market
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Real-time cryptocurrency prices streamed through WebSockets.
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
        {/* Connection banner */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Market Connection
            </p>

            <div className="mt-2 flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  isConnected
                    ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                    : isConnecting
                      ? "animate-pulse bg-amber-400"
                      : "bg-red-500"
                }`}
              />

              <span
                className={`font-semibold ${
                  isConnected
                    ? "text-emerald-400"
                    : isConnecting
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {isConnected
                  ? "Live"
                  : isConnecting
                    ? "Connecting..."
                    : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-400">
            WebSocket market feed
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MarketCard
            label="Tracked Assets"
            value={String(
              trades.length
            )}
            description="Live market symbols"
          />

          <MarketCard
            label="Average Price"
            value={`$${formatPrice(
              averagePrice
            )}`}
            description="Across visible assets"
          />

          <MarketCard
            label="Market Activity"
            value={`$${totalMarketValue.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 0,
              }
            )}`}
            description="Price × latest volume"
          />

          <MarketCard
            label="Volume Filter"
            value={
              appliedMinVolume
            }
            description="Minimum trade volume"
          />
        </div>

        {/* Filter */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-semibold">
                Market Filter
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Filter incoming trades by minimum volume.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Minimum Volume
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    minVolumeInput
                  }
                  onChange={(event) =>
                    setMinVolumeInput(
                      event.target.value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      handleApplyFilter();
                    }
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 sm:w-56"
                  placeholder="0"
                />
              </div>

              <button
                type="button"
                onClick={
                  handleApplyFilter
                }
                className="self-end rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
              >
                Apply Filter
              </button>
            </div>
          </div>

          {filterError ? (
            <p className="mt-4 text-sm text-red-400">
              {filterError}
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Showing trades with volume greater than or equal to{" "}
              <span className="font-semibold text-white">
                {
                  appliedMinVolume
                }
              </span>
            </p>
          )}
        </div>

        {/* Market table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <div>
              <h2 className="font-semibold">
                Live Assets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest market update for each asset.
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Auto updating
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Asset
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Updated
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Price
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Volume
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Trade
                  </th>
                </tr>
              </thead>

              <tbody>
                {trades.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={
                        5
                      }
                      className="px-6 py-20 text-center"
                    >
                      <div className="flex flex-col items-center gap-4">
                        {(isConnecting ||
                          isConnected) && (
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
                        )}

                        <div>
                          <p className="font-medium text-slate-300">
                            {isConnecting
                              ? "Connecting to market"
                              : isConnected
                                ? "Waiting for live market data"
                                : "Market connection closed"}
                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            {isConnected
                              ? "New trades will appear automatically."
                              : "Check the backend WebSocket connection."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trades.map(
                    (
                      trade,
                      index
                    ) => {
                      const shortSymbol =
                        trade.s
                          .replace(
                            "BINANCE:",
                            ""
                          )
                          .replace(
                            "USDT",
                            ""
                          );

                      return (
                        <tr
                          key={`${trade.t}-${trade.p}-${index}`}
                          className="border-b border-slate-800/70 transition last:border-0 hover:bg-slate-800/30"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">
                                {
                                  shortSymbol
                                }
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {
                                    shortSymbol
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    trade.s
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-400">
                            {formatTime(
                              trade.t
                            )}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <p className="text-lg font-semibold">
                              $
                              {formatPrice(
                                trade.p
                              )}
                            </p>

                            <p className="mt-1 text-xs text-emerald-400">
                              ● Live
                            </p>
                          </td>

                          <td className="px-6 py-5 text-right text-slate-300">
                            {trade.v.toLocaleString()}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openTradeModal(
                                    trade,
                                    "BUY"
                                  )
                                }
                                className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/20 transition hover:bg-emerald-500 hover:text-white"
                              >
                                Buy
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openTradeModal(
                                    trade,
                                    "SELL"
                                  )
                                }
                                className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 ring-1 ring-red-500/20 transition hover:bg-red-500 hover:text-white"
                              >
                                Sell
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trade Modal */}
      {selectedTrade &&
        tradeAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
              <div className="border-b border-slate-800 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        tradeAction ===
                        "BUY"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {
                        tradeAction
                      } ORDER
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {
                        selectedTrade.s
                      }
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeTradeModal
                    }
                    disabled={
                      tradeLoading
                    }
                    className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Current Market Price
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    $
                    {formatPrice(
                      selectedTrade.p
                    )}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Live price
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
                    value={
                      quantity
                    }
                    onChange={(
                      event
                    ) =>
                      setQuantity(
                        event.target
                          .value
                      )
                    }
                    placeholder="Enter quantity"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                {quantity &&
                  Number(
                    quantity
                  ) > 0 && (
                    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Estimated Total
                        </span>

                        <span className="text-xl font-bold">
                          $
                          {(
                            selectedTrade.p *
                            Number(
                              quantity
                            )
                          ).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                {tradeError && (
                  <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {tradeError}
                  </div>
                )}

                {tradeMessage && (
                  <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                    {
                      tradeMessage
                    }
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={
                      closeTradeModal
                    }
                    disabled={
                      tradeLoading
                    }
                    className="flex-1 rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleTrade
                    }
                    disabled={
                      tradeLoading ||
                      !quantity ||
                      Number(
                        quantity
                      ) <= 0
                    }
                    className={`flex-1 rounded-lg px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      tradeAction ===
                      "BUY"
                        ? "bg-emerald-600 hover:bg-emerald-500"
                        : "bg-red-600 hover:bg-red-500"
                    }`}
                  >
                    {tradeLoading
                      ? "Processing..."
                      : `Confirm ${tradeAction}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}

function MarketCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
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