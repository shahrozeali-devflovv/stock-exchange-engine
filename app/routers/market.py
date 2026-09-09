import asyncio

from fastapi import APIRouter, WebSocket

from app.services.market_stream_service import (
    connect_to_market,
    subscribe_to_stock,
    receive_trade,
    filter_trades,
)

from app.services.market_service import (
    update_stock_price,
    cache_stock_price,
)


router = APIRouter(
    prefix="/ws",
    tags=["Market WebSocket"]
)


@router.websocket("/market")
async def market_websocket(
    websocket: WebSocket,
    min_volume: float = 0
):
    await websocket.accept()

    finnhub_ws = connect_to_market()

    symbols = [
        "BINANCE:BTCUSDT",
        "BINANCE:ETHUSDT",
        "BINANCE:BNBUSDT",
        "BINANCE:SOLUSDT",
    ]

    for symbol in symbols:
        subscribe_to_stock(
            finnhub_ws,
            symbol
        )

    while True:
        trade = await asyncio.to_thread(
            receive_trade,
            finnhub_ws
        )

        filtered_trade = filter_trades(
            trade,
            min_volume=min_volume
        )

        if filtered_trade:
            for market_trade in filtered_trade["data"]:
                await asyncio.to_thread(
                    cache_stock_price,
                    market_trade["s"],
                    market_trade["p"]
                )
                stock_id = await asyncio.to_thread(
                    update_stock_price,
                    market_trade["s"],
                    market_trade["p"]
                )

                market_trade["stock_id"] = stock_id

            await websocket.send_json(
                filtered_trade
            )