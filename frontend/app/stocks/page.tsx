"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  buyStock,
  sellStock,
} from "@/services/tradeService";

import { getWallet } from "@/services/walletService";
import { getPortfolio } from "@/services/portfolioService";

type Trade = {
  t: number;
  p: number;
  v: number;
  s: string;
  stock_id: number;
};

type Wallet = {
  balance: number;
};

type PortfolioItem = {
  stock_id: number;
  symbol: string;
  name: string;
  quantity: number;
  current_price: number;
  market_value: number;
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

  const [tradeError, setTradeError] =
    useState("");

  const [wallet, setWallet] =
    useState<Wallet | null>(null);

  const [portfolio, setPortfolio] =
    useState<PortfolioItem[]>([]);

  const [accountLoading, setAccountLoading] =
    useState(true);

  const [toastMessage, setToastMessage] =
    useState("");

  const socketRef =
    useRef<WebSocket | null>(null);

  /*
   * Load Wallet + Portfolio
   */
  const loadAccountData = async () => {
    try {
      setAccountLoading(true);

      const [
        walletData,
        portfolioData,
      ] = await Promise.all([
        getWallet(),
        getPortfolio(),
      ]);

      setWallet(walletData);

      setPortfolio(
        Array.isArray(portfolioData)
          ? portfolioData
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load account data:",
        error
      );
    } finally {
      setAccountLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  /*
   * WebSocket
   */
  useEffect(() => {
    setIsConnecting(true);
    setIsConnected(false);

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/market?min_volume=${appliedMinVolume}`
    );

    socketRef.current = ws;

    ws.onopen = () => {
      console.log(
        "WebSocket connected"
      );

      setIsConnected(true);
      setIsConnecting(false);
    };

    ws.onmessage = (event) => {
      try {
        const message =
          JSON.parse(event.data);

        if (
          message.type === "trade" &&
          Array.isArray(message.data)
        ) {
          setTrades(
            (currentTrades) => {
              const updatedTrades = [
                ...currentTrades,
              ];

              message.data.forEach(
                (newTrade: Trade) => {
                  const existingIndex =
                    updatedTrades.findIndex(
                      (trade) =>
                        trade.s ===
                        newTrade.s
                    );

                  if (
                    existingIndex >= 0
                  ) {
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
            }
          );
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

  /*
   * Volume Filter
   */
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

  /*
   * Formatting
   */
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

  const formatMoney = (
    value: number
  ) =>
    value.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  /*
   * Open Trade Modal
   */
  const openTradeModal = (
    trade: Trade,
    action: "BUY" | "SELL"
  ) => {
    setSelectedTrade(trade);

    setTradeAction(action);

    setQuantity("");

    setTradeError("");

    /*
     * Refresh wallet and portfolio whenever
     * trade modal is opened.
     */
    loadAccountData();
  };

  /*
   * Close Trade Modal
   */
  const closeTradeModal = () => {
    if (tradeLoading) {
      return;
    }

    setSelectedTrade(null);

    setTradeAction(null);

    setQuantity("");

    setTradeError("");
  };

  /*
   * Current selected holding
   */
  const selectedHolding =
    selectedTrade
      ? portfolio.find(
          (item) =>
            item.stock_id ===
            selectedTrade.stock_id
        )
      : undefined;

  const ownedQuantity =
    selectedHolding?.quantity ?? 0;

  const parsedQuantity =
    Number(quantity) || 0;

  const estimatedTotal =
    selectedTrade
      ? selectedTrade.p *
        parsedQuantity
      : 0;

  const balanceAfterPurchase =
    wallet
      ? wallet.balance -
        estimatedTotal
      : 0;

  const insufficientBalance =
    tradeAction === "BUY" &&
    wallet !== null &&
    parsedQuantity > 0 &&
    estimatedTotal >
      wallet.balance;

  const insufficientStocks =
    tradeAction === "SELL" &&
    parsedQuantity > 0 &&
    parsedQuantity >
      ownedQuantity;

  /*
   * Buy / Sell
   */
  const handleTrade = async () => {
    if (
      !selectedTrade ||
      !tradeAction
    ) {
      return;
    }

    const tradeQuantity =
      Number(quantity);

    if (
      Number.isNaN(
        tradeQuantity
      ) ||
      tradeQuantity <= 0 ||
      !Number.isInteger(
        tradeQuantity
      )
    ) {
      setTradeError(
        "Quantity must be a positive whole number."
      );

      return;
    }

    /*
     * Frontend balance validation
     */
    if (
      tradeAction === "BUY" &&
      wallet &&
      selectedTrade.p *
        tradeQuantity >
        wallet.balance
    ) {
      setTradeError(
        "You do not have enough balance for this purchase."
      );

      return;
    }

    /*
     * Frontend portfolio validation
     */
    if (
      tradeAction === "SELL" &&
      ownedQuantity === 0
    ) {
      setTradeError(
        "You don't have this stock in your portfolio."
      );

      return;
    }

    if (
      tradeAction === "SELL" &&
      tradeQuantity >
        ownedQuantity
    ) {
      setTradeError(
        `You only own ${ownedQuantity} units of this stock.`
      );

      return;
    }

    try {
      setTradeLoading(true);

      setTradeError("");

      let response;

      if (
        tradeAction === "BUY"
      ) {
        response =
          await buyStock(
            selectedTrade.stock_id,
            tradeQuantity
          );
      } else {
        response =
          await sellStock(
            selectedTrade.stock_id,
            tradeQuantity
          );
      }

      const shortSymbol =
        selectedTrade.s
          .replace(
            "BINANCE:",
            ""
          )
          .replace(
            "USDT",
            ""
          );

      const successMessage =
        response?.message ||
        (tradeAction === "BUY"
          ? `Successfully purchased ${tradeQuantity} ${shortSymbol}`
          : `Successfully sold ${tradeQuantity} ${shortSymbol}`);

      /*
       * Refresh latest wallet
       * and portfolio after trade.
       */
      await loadAccountData();

      /*
       * Close modal automatically.
       */
      setSelectedTrade(null);

      setTradeAction(null);

      setQuantity("");

      setTradeError("");

      /*
       * Show success toast.
       */
      setToastMessage(
        successMessage
      );

      setTimeout(() => {
        setToastMessage("");
      }, 3000);
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

  /*
   * Most recent market update
   */
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
              Real-time cryptocurrency
              prices streamed through
              WebSockets.
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
            description=""
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
                Filter incoming trades
                by minimum volume.
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
                  onChange={(
                    event
                  ) =>
                    setMinVolumeInput(
                      event.target
                        .value
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
              Showing trades with
              volume greater than or
              equal to{" "}
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
                Latest market update
                for each asset.
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-2 text-xs font-medium text-green-700 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />

              Auto updating
            </div>
          </div>

          {trades.length === 0 ? (
            /* Empty State */
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

              {/* Tablet / Desktop */}
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
                {/* Current Market Price */}
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

                {/* BUY Wallet Information */}
                {tradeAction ===
                  "BUY" && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-gray-500">
                        Available Balance
                      </span>

                      <span className="text-right font-bold text-[#14532D]">
                        {accountLoading
                          ? "Loading..."
                          : wallet
                            ? `$${formatMoney(
                                wallet.balance
                              )}`
                            : "Unavailable"}
                      </span>
                    </div>
                  </div>
                )}

                {/* SELL Portfolio Information */}
                {tradeAction ===
                  "SELL" && (
                  <div
                    className={`mt-4 rounded-xl border p-4 ${
                      accountLoading
                        ? "border-gray-200 bg-gray-50"
                        : ownedQuantity >
                            0
                          ? "border-orange-200 bg-orange-50"
                          : "border-red-200 bg-red-50"
                    }`}
                  >
                    {accountLoading ? (
                      <p className="text-sm text-gray-500">
                        Checking your
                        portfolio...
                      </p>
                    ) : ownedQuantity >
                      0 ? (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-gray-600">
                          You Own
                        </span>

                        <span className="font-bold text-orange-600">
                          {ownedQuantity.toLocaleString()}{" "}
                          units
                        </span>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-red-600">
                          You don&apos;t
                          have this stock
                          in your
                          portfolio.
                        </p>

                        <p className="mt-1 text-sm leading-5 text-red-500">
                          You need to
                          purchase this
                          asset before
                          you can sell
                          it.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity */}
                {!(
                  tradeAction ===
                    "SELL" &&
                  !accountLoading &&
                  ownedQuantity === 0
                ) && (
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
                      max={
                        tradeAction ===
                        "SELL"
                          ? ownedQuantity
                          : undefined
                      }
                      step="1"
                      value={
                        quantity
                      }
                      onChange={(
                        event
                      ) => {
                        setQuantity(
                          event.target
                            .value
                        );

                        setTradeError(
                          ""
                        );
                      }}
                      placeholder="Enter quantity"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:text-base"
                    />

                    {tradeAction ===
                      "SELL" &&
                      ownedQuantity >
                        0 && (
                        <p className="mt-2 text-xs text-gray-500">
                          Maximum
                          available:{" "}
                          <span className="font-bold text-[#14532D]">
                            {
                              ownedQuantity
                            }
                          </span>
                        </p>
                      )}
                  </div>
                )}

                {/* Estimated Total */}
                {quantity &&
                  parsedQuantity > 0 &&
                  !(
                    tradeAction ===
                      "SELL" &&
                    ownedQuantity === 0
                  ) && (
                    <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-gray-500">
                          {tradeAction ===
                          "BUY"
                            ? "Estimated Cost"
                            : "Estimated Sale"}
                        </span>

                        <span className="text-right text-xl font-bold text-orange-600">
                          $
                          {formatMoney(
                            estimatedTotal
                          )}
                        </span>
                      </div>

                      {/* Balance After Buy */}
                      {tradeAction ===
                        "BUY" &&
                        wallet && (
                          <div className="mt-3 flex items-center justify-between gap-4 border-t border-orange-200 pt-3">
                            <span className="text-sm font-medium text-gray-500">
                              Balance
                              After
                              Purchase
                            </span>

                            <span
                              className={`text-right font-bold ${
                                balanceAfterPurchase >=
                                0
                                  ? "text-green-700"
                                  : "text-red-600"
                              }`}
                            >
                              $
                              {formatMoney(
                                balanceAfterPurchase
                              )}
                            </span>
                          </div>
                        )}
                    </div>
                  )}

                {/* Insufficient Balance */}
                {insufficientBalance && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-bold text-red-600">
                      Insufficient
                      balance
                    </p>

                    <p className="mt-1 text-xs text-red-500">
                      Reduce the
                      quantity or add
                      more funds to
                      your account.
                    </p>
                  </div>
                )}

                {/* Insufficient Stocks */}
                {insufficientStocks && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-bold text-red-600">
                      Not enough
                      shares
                    </p>

                    <p className="mt-1 text-xs text-red-500">
                      You only own{" "}
                      {ownedQuantity}{" "}
                      units of this
                      asset.
                    </p>
                  </div>
                )}

                {/* Backend Trade Error */}
                {tradeError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium leading-5 text-red-600">
                    {tradeError}
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

                  {!(
                    tradeAction ===
                      "SELL" &&
                    !accountLoading &&
                    ownedQuantity === 0
                  ) && (
                    <button
                      type="button"
                      onClick={
                        handleTrade
                      }
                      disabled={
                        tradeLoading ||
                        accountLoading ||
                        !quantity ||
                        parsedQuantity <=
                          0 ||
                        insufficientBalance ||
                        insufficientStocks
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
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed right-4 top-4 z-[200] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-green-200 bg-white p-4 shadow-2xl sm:right-6 sm:top-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
              ✓
            </div>

            <div className="min-w-0">
              <p className="font-bold text-[#14532D]">
                Trade successful
              </p>

              <p className="mt-1 break-words text-sm text-gray-600">
                {toastMessage}
              </p>
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