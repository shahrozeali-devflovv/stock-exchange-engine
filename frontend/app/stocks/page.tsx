"use client";

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

  // This comes from our backend database
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
  const updatedTrades = [...currentTrades];

  message.data.forEach((newTrade: Trade) => {
    const existingIndex = updatedTrades.findIndex(
      (trade) => trade.s === newTrade.s
    );

    if (existingIndex >= 0) {
      updatedTrades[existingIndex] = newTrade;
    } else {
      updatedTrades.push(newTrade);
    }
  });

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
        error?.response?.data
          ?.detail ||
          "Trade failed. Please try again."
      );
    } finally {
      setTradeLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Realtime Stocks
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Live BTC/USDT market data streamed through WebSockets.
            </p>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${
                isConnected
                  ? "bg-green-500"
                  : isConnecting
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />

            <span className="text-sm text-slate-300">
              {isConnected
                ? "Connected"
                : isConnecting
                  ? "Connecting..."
                  : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Volume Filter */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <label className="mb-2 block text-sm font-medium text-slate-400">
            Minimum Volume
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
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
              className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none transition focus:border-blue-500"
              placeholder="0"
            />

            <button
              type="button"
              onClick={
                handleApplyFilter
              }
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium transition hover:bg-blue-500"
            >
              Apply Filter
            </button>
          </div>

          {filterError ? (
            <p className="mt-2 text-sm text-red-400">
              {filterError}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              Showing trades with
              volume greater than or
              equal to{" "}
              <span className="font-semibold text-white">
                {
                  appliedMinVolume
                }
              </span>
            </p>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">

              <thead className="border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-medium text-slate-400">
                    Time
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-medium text-slate-400">
                    Symbol
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-medium text-slate-400">
                    Price
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-medium text-slate-400">
                    Volume
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-medium text-slate-400">
                    Action
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
                      className="px-5 py-14 text-center"
                    >
                      <div className="flex flex-col items-center gap-4">

                        {(isConnecting ||
                          isConnected) && (
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
                        )}

                        <p className="text-slate-400">
                          {isConnecting
                            ? "Connecting to market..."
                            : isConnected
                              ? "Waiting for realtime trades..."
                              : "Market connection is closed."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trades.map(
                    (
                      trade,
                      index
                    ) => (
                      <tr
                        key={`${trade.t}-${trade.p}-${index}`}
                        className="border-t border-slate-800 transition hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4 text-slate-400">
                          {formatTime(
                            trade.t
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {
                            trade.s
                          }
                        </td>

                        <td className="px-5 py-4 text-right font-semibold">
                          $
                          {trade.p.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {
                            trade.v
                          }
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openTradeModal(
                                  trade,
                                  "BUY"
                                )
                              }
                              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold transition hover:bg-green-500"
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
                              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
                            >
                              Sell
                            </button>

                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Buy / Sell Modal */}
      {selectedTrade &&
        tradeAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

            <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">

              <h2 className="text-2xl font-bold">
                {tradeAction ===
                "BUY"
                  ? "Buy"
                  : "Sell"}{" "}
                {
                  selectedTrade.s
                }
              </h2>

              <div className="mt-5">

                <p className="text-sm text-slate-400">
                  Current Price
                </p>

                <p className="text-xl font-semibold">
                  $
                  {selectedTrade.p.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>

              </div>

              <div className="mt-5">

                <label className="mb-2 block text-sm text-slate-400">
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
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

              </div>

              {quantity &&
                Number(
                  quantity
                ) > 0 && (
                  <div className="mt-5 rounded-lg bg-slate-800 p-4">

                    <p className="text-sm text-slate-400">
                      Estimated
                      Total
                    </p>

                    <p className="mt-1 text-xl font-bold">
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
                    </p>

                  </div>
                )}

              {tradeError && (
                <p className="mt-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
                  {tradeError}
                </p>
              )}

              {tradeMessage && (
                <p className="mt-4 rounded-lg bg-green-950/50 p-3 text-sm text-green-400">
                  {tradeMessage}
                </p>
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
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-3 transition hover:bg-slate-800 disabled:opacity-50"
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
                      ? "bg-green-600 hover:bg-green-500"
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
        )}
    </main>
  );
}