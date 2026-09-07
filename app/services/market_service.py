import requests

from app.core.config import settings


def get_stock_quote(symbol: str):
    url = "https://www.alphavantage.co/query"

    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": settings.ALPHA_VANTAGE_API_KEY,
    }

    response = requests.get(url, params=params)

    response.raise_for_status()

    return response.json()