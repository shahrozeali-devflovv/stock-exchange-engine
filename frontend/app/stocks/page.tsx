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

  const lastUpdate =
    trades.length > 0
      ? Math.max(
          ...trades.map(
            (trade) => trade.t
          )
        )
      : null;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7FAF7] text-gray-900">
      {/* Page Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500 sm:text-sm">
              Markets
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#14532D] sm:text-3xl">
              Live Market
            </h1>

            <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
              Real-time cryptocurrency prices streamed through WebSockets.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-fit shrink-0 items-center justify-center rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Connection Banner */}
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Market Connection
            </p>

            <div className="mt-2 flex items-center gap-3">
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${
                  isConnected
                    ? "bg-green-600 shadow-[0_0_12px_rgba(22,163,74,0.4)]"
                    : isConnecting
                      ? "animate-pulse bg-orange-500"
                      : "bg-red-500"
                }`}
              />

              <span
                className={`font-bold ${
                  isConnected
                    ? "text-green-700"
                    : isConnecting
                      ? "text-orange-600"
                      : "text-red-600"
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

          <div className="w-fit rounded-lg bg-white px-4 py-2 text-xs font-medium text-green-700 shadow-sm sm:text-sm">
            WebSocket market feed
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <MarketCard
            label="Live Assets"
            value={String(
              trades.length
            )}
            description="Currently tracked symbols"
            accent="green"
          />

          <MarketCard
            label="Connection"
            value={
              isConnected
                ? "Live"
                : isConnecting
                  ? "Connecting"
                  : "Offline"
            }
            description="WebSocket market status"
            accent="orange"
          />

          <MarketCard
            label="Volume Filter"
            value={
              appliedMinVolume
            }
            description="Minimum trade volume"
            accent="green"
          />

          <MarketCard
            label="Last Update"
            value={
              lastUpdate
                ? formatTime(
                    lastUpdate
                  )
                : "Waiting"
            }
            description="Most recent market event"
            accent="orange"
          />
        </div>

        {/* Market Filter */}
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 h-1 w-10 rounded-full bg-orange-500" />

              <h2 className="font-bold text-[#14532D]">
                Market Filter
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Filter incoming trades by minimum volume.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
              <div className="w-full sm:w-auto">
                <label
                  htmlFor="minimum-volume"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  Minimum Volume
                </label>

                <input
                  id="minimum-volume"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:w-56 sm:text-base"
                  placeholder="0"
                />
              </div>

              <button
                type="button"
                onClick={
                  handleApplyFilter
                }
                className="w-full rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 sm:w-auto sm:text-base"
              >
                Apply Filter
              </button>
            </div>
          </div>

          {filterError ? (
            <p className="mt-4 text-sm font-medium text-red-600">
              {filterError}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-gray-500">
              Showing trades with volume greater than or equal to{" "}
              <span className="font-bold text-[#14532D]">
                {
                  appliedMinVolume
                }
              </span>
            </p>
          )}
        </div>

        {/* Market */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0">
              <h2 className="font-bold text-[#14532D]">
                Live Assets
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Latest market update for each asset.
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-2 text-xs font-medium text-green-700 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
              Auto updating
            </div>
          </div>

          {/* Empty State */}
          {trades.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center px-4 py-12 sm:min-h-[360px]">
              <div className="flex flex-col items-center gap-4 text-center">
                {(isConnecting ||
                  isConnected) && (
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />
                )}

                <div>
                  <p className="font-semibold text-gray-700">
                    {isConnecting
                      ? "Connecting to market"
                      : isConnected
                        ? "Waiting for live market data"
                        : "Market connection closed"}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {isConnected
                      ? "New trades will appear automatically."
                      : "Check the backend WebSocket connection."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Market Cards */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {trades.map(
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
                      <div
                        key={`${trade.t}-${trade.p}-${index}`}
                        className="p-4 transition hover:bg-green-50/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-[11px] font-bold text-green-700">
                            {
                              shortSymbol
                            }
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-bold text-[#14532D]">
                                  {
                                    shortSymbol
                                  }
                                </p>

                                <p className="mt-1 truncate text-xs text-gray-500">
                                  {
                                    trade.s
                                  }
                                </p>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-base font-bold text-gray-900">
                                  $
                                  {formatPrice(
                                    trade.p
                                  )}
                                </p>

                                <p className="mt-1 text-xs font-semibold text-green-600">
                                  ● Live
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div className="rounded-lg bg-[#F7FAF7] p-3">
                                <p className="text-xs text-gray-500">
                                  Volume
                                </p>

                                <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                                  {trade.v.toLocaleString()}
                                </p>
                              </div>

                              <div className="rounded-lg bg-[#F7FAF7] p-3">
                                <p className="text-xs text-gray-500">
                                  Updated
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                  {formatTime(
                                    trade.t
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  openTradeModal(
                                    trade,
                                    "BUY"
                                  )
                                }
                                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
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
                                className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 ring-1 ring-red-200 transition hover:bg-red-600 hover:text-white"
                              >
                                Sell
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Tablet / Desktop Table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#F7FAF7]">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500 lg:px-6">
                        Asset
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500 lg:px-6">
                        Updated
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500 lg:px-6">
                        Price
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500 lg:px-6">
                        Volume
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500 lg:px-6">
                        Trade
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {trades.map(
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
                            className="border-b border-gray-100 transition last:border-0 hover:bg-green-50/50"
                          >
                            <td className="px-5 py-5 lg:px-6">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700">
                                  {
                                    shortSymbol
                                  }
                                </div>

                                <div className="min-w-0">
                                  <p className="font-bold text-[#14532D]">
                                    {
                                      shortSymbol
                                    }
                                  </p>

                                  <p className="mt-1 max-w-[170px] truncate text-xs text-gray-500">
                                    {
                                      trade.s
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-500 lg:px-6">
                              {formatTime(
                                trade.t
                              )}
                            </td>

                            <td className="whitespace-nowrap px-5 py-5 text-right lg:px-6">
                              <p className="text-lg font-bold text-gray-900">
                                $
                                {formatPrice(
                                  trade.p
                                )}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-green-600">
                                ● Live
                              </p>
                            </td>

                            <td className="whitespace-nowrap px-5 py-5 text-right text-gray-600 lg:px-6">
                              {trade.v.toLocaleString()}
                            </td>

                            <td className="px-5 py-5 lg:px-6">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openTradeModal(
                                      trade,
                                      "BUY"
                                    )
                                  }
                                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
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
                                  className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-600 ring-1 ring-red-200 transition hover:bg-red-600 hover:text-white"
                                >
                                  Sell
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Trade Modal */}
      {selectedTrade &&
        tradeAction && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl border border-gray-200 bg-white text-gray-900 shadow-2xl sm:max-w-md sm:rounded-2xl">
              {/* Modal Header */}
              <div className="border-b border-gray-100 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold sm:text-sm ${
                        tradeAction ===
                        "BUY"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {
                        tradeAction
                      }{" "}
                      ORDER
                    </p>

                    <h2 className="mt-1 truncate text-xl font-bold text-[#14532D] sm:text-2xl">
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
                    aria-label="Close trade modal"
                    className="shrink-0 rounded-lg px-3 py-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* Current Price */}
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Current Market Price
                  </p>

                  <p className="mt-2 break-all text-2xl font-bold text-[#14532D] sm:text-3xl">
                    $
                    {formatPrice(
                      selectedTrade.p
                    )}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-green-600">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    Live price
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-5">
                  <label
                    htmlFor="trade-quantity"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Quantity
                  </label>

                  <input
                    id="trade-quantity"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:text-base"
                  />
                </div>

                {/* Estimated Total */}
                {quantity &&
                  Number(
                    quantity
                  ) > 0 && (
                    <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Estimated Total
                        </span>

                        <span className="break-all text-xl font-bold text-orange-600">
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

                {/* Trade Error */}
                {tradeError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium leading-5 text-red-600">
                    {tradeError}
                  </div>
                )}

                {/* Trade Success */}
                {tradeMessage && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium leading-5 text-green-700">
                    {
                      tradeMessage
                    }
                  </div>
                )}

                {/* Buttons */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={
                      closeTradeModal
                    }
                    disabled={
                      tradeLoading
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:text-base"
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
                    className={`flex-1 rounded-lg px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:text-base ${
                      tradeAction ===
                      "BUY"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
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
  accent,
}: {
  label: string;
  value: string;
  description: string;
  accent: "green" | "orange";
}) {
  const isGreen =
    accent === "green";

  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          isGreen
            ? "bg-green-600"
            : "bg-orange-500"
        }`}
      />

      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-all text-xl font-bold text-[#14532D] sm:text-2xl">
        {value}
      </p>

      <p
        className={`mt-1 text-xs font-medium ${
          isGreen
            ? "text-green-600"
            : "text-orange-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}