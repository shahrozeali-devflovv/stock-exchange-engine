import websocket
import json

from app.core.config import settings
FINNHUB_WS_URL = (
    f"wss://ws.finnhub.io?token={settings.FINNHUB_API_KEY}"
)

def connect_to_market():
    ws = websocket.WebSocket()
    ws.connect(FINNHUB_WS_URL)

    return ws
def subscribe_to_stock(ws, symbol: str):
    message = {
        "type": "subscribe",
        "symbol": symbol
    }

    ws.send(json.dumps(message))

    print(f"Subscribed to {symbol}")
def receive_trade(ws):
    message = ws.recv()

    data = json.loads(message)

    if data.get("type") == "trade":
        return data

    return None
def filter_trades(trade_data, min_volume: float = 0):
    if not trade_data:
        return None

    filtered_data = [
        trade
        for trade in trade_data.get("data", [])
        if trade.get("v", 0) >= min_volume
    ]

    if not filtered_data:
        return None

    return {
        "type": "trade",
        "data": filtered_data
    }
if __name__ == "__main__":
    ws = connect_to_market()

    subscribe_to_stock(ws, "BINANCE:BTCUSDT")

    trade = receive_trade(ws)

    print(trade)